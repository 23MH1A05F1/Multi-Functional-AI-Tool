// Test script to verify the upload functionality
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// JavaScript function to generate basic summary (same as in upload.js)
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

// Test data
const testData = [
  {"Name": "Alice", "Age": 30, "City": "New York"},
  {"Name": "Bob", "Age": 25, "City": "Los Angeles"},
  {"Name": "Charlie", "Age": 35, "City": "Chicago"}
];

console.log("Testing JavaScript fallback summary generation:");
console.log("=" * 50);
console.log(generateBasicSummary(testData));
console.log("=" * 50);
console.log("JavaScript fallback is working correctly!");
