import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { authenticateJWT } from '../middleware/auth.js';
import Upload from '../models/Upload.js';
import { deleteUpload } from '../controllers/uploadController.js';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Simple in-memory cache for summaries keyed by hash of JSON data
const summaryCache = new Map();

// JavaScript function to generate basic summary (fallback when Python fails)
function generateBasicSummary(jsonData) {
  if (!jsonData || jsonData.length === 0) {
    return "No data available";
  }

  const summaryLines = [];
  summaryLines.push(`Number of rows: ${jsonData.length}`);
  
  // Get column names from first row
  const columns = Object.keys(jsonData[0]);
  summaryLines.push(`Number of columns: ${columns.length}`);
  summaryLines.push("Columns:");
  summaryLines.push(columns.join(", "));
  
  // Show first 5 rows
  summaryLines.push("First 5 rows:");
  const firstFiveRows = jsonData.slice(0, 5);
  firstFiveRows.forEach((row, index) => {
    const rowValues = columns.map(col => row[col] || '').join(" | ");
    summaryLines.push(`${index + 1}: ${rowValues}`);
  });
  
  return summaryLines.join("\n");
}

// Function to try Python script with fallback to JavaScript
async function generateSummary(jsonData) {
  return new Promise((resolve) => {
    try {
      // Try to save JSON data to temp file for Python script
      const tempJsonPath = path.join(__dirname, '../../temp_upload.json');
      
      // Check if directory exists and create if needed
      const tempDir = path.dirname(tempJsonPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(tempJsonPath, JSON.stringify(jsonData), 'utf-8');

      // Call Python script
      const pythonScriptPath = path.join(__dirname, '../python_scripts/excel_summary_local.py');
      
      // Try different Python commands
      const pythonCommands = ['python3', 'python', 'py'];
      
      function tryPythonCommand(commands, index = 0) {
        if (index >= commands.length) {
          console.log('All Python commands failed, using JavaScript fallback');
          // Clean up temp file
          try {
            fs.unlinkSync(tempJsonPath);
          } catch (cleanupErr) {
            console.error('Error cleaning up temp file:', cleanupErr);
          }
          resolve(generateBasicSummary(jsonData));
          return;
        }
        
        const command = commands[index];
        execFile(command, [pythonScriptPath, tempJsonPath], { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error with ${command}:`, error.message);
            // Check if it's a pandas import error specifically
            if (error.message.includes('pandas') || error.message.includes('ModuleNotFoundError')) {
              console.log('Python pandas not available, using JavaScript fallback');
              // Clean up temp file
              try {
                fs.unlinkSync(tempJsonPath);
              } catch (cleanupErr) {
                console.error('Error cleaning up temp file:', cleanupErr);
              }
              resolve(generateBasicSummary(jsonData));
              return;
            }
            tryPythonCommand(commands, index + 1);
            return;
          }
          
          if (stderr) {
            console.error('Python script stderr:', stderr);
            // Also check stderr for pandas errors
            if (stderr.includes('pandas') || stderr.includes('ModuleNotFoundError')) {
              console.log('Python pandas not available (stderr), using JavaScript fallback');
              // Clean up temp file
              try {
                fs.unlinkSync(tempJsonPath);
              } catch (cleanupErr) {
                console.error('Error cleaning up temp file:', cleanupErr);
              }
              resolve(generateBasicSummary(jsonData));
              return;
            }
          }
          
          const summary = stdout.trim();
          if (summary) {
            console.log(`Successfully generated summary using ${command}`);
            // Clean up temp file
            try {
              fs.unlinkSync(tempJsonPath);
            } catch (cleanupErr) {
              console.error('Error cleaning up temp file:', cleanupErr);
            }
            resolve(summary);
          } else {
            console.log(`${command} returned empty summary, trying next command`);
            tryPythonCommand(commands, index + 1);
          }
        });
      }
      
      tryPythonCommand(pythonCommands);
      
    } catch (fileErr) {
      console.error('Error with file operations:', fileErr);
      resolve(generateBasicSummary(jsonData));
    }
  });
}

router.post('/', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse Excel file buffer to JSON
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Compute hash of JSON data for caching
    const hash = crypto.createHash('sha256').update(JSON.stringify(jsonData)).digest('hex');

    // Check cache for existing summary
    if (summaryCache.has(hash)) {
      const cachedSummary = summaryCache.get(hash);

      // Save upload with cached summary
      const newUpload = new Upload({
        userId: req.user.id,
        filename: req.file.originalname,
        data: jsonData,
        summary: cachedSummary,
      });

      await newUpload.save();
      return res.status(201).json({ upload: newUpload, cached: true });
    }

    // Generate summary using Python script with JavaScript fallback
    const summary = await generateSummary(jsonData);

    // Cache the summary
    summaryCache.set(hash, summary);

    // Save upload with summary
    const newUpload = new Upload({
      userId: req.user.id,
      filename: req.file.originalname,
      data: jsonData,
      summary,
    });

    try {
      await newUpload.save();
      res.status(201).json({ upload: newUpload, cached: false });
    } catch (saveErr) {
      console.error('Error saving upload:', saveErr);
      res.status(500).json({ message: 'Error saving upload with summary' });
    }
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

router.get('/history', authenticateJWT, async (req, res) => {
  try {
    let uploads;
    if (req.user.role === 'admin') {
      uploads = await Upload.find().populate('userId', 'username email').sort({ createdAt: -1 });
    } else {
      uploads = await Upload.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(uploads);
  } catch (err) {
    console.error('Error fetching upload history:', err);
    res.status(500).json({ message: 'Server error fetching upload history' });
  }
});

router.delete('/:id', authenticateJWT, deleteUpload);

export default router;
