import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserCharts } from '../store/chartSlice';
import { uploadFile, fetchUploadHistory } from '../store/uploadSlice';
import Chart from 'chart.js/auto';
import UploadHistory from '../components/UploadHistory';

import { deleteUpload } from '../store/uploadSlice';
import FilePreviewTable from '../components/FilePreviewTable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const colorPalette = [
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
  'rgba(199, 199, 199, 0.6)',
  'rgba(83, 102, 255, 0.6)',
  'rgba(255, 99, 255, 0.6)',
  'rgba(99, 255, 132, 0.6)',
];

const borderColorPalette = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(199, 199, 199, 1)',
  'rgba(83, 102, 255, 1)',
  'rgba(255, 99, 255, 1)',
  'rgba(99, 255, 132, 1)',
];

const ChartCard = ({ chart }) => {
  const chartRef = React.useRef(null);
  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');

    // Generate colors for each data point
    const dataLength = chart.data.length;
    const backgroundColors = [];
    const borderColors = [];
    for (let i = 0; i < dataLength; i++) {
      backgroundColors.push(colorPalette[i % colorPalette.length]);
      borderColors.push(borderColorPalette[i % borderColorPalette.length]);
    }

    const chartInstance = new Chart(ctx, {
      type: chart.chartType === '3d-column' || chart.chartType === '3d-bar' ? 'bar' : chart.chartType,
      data: {
        labels: chart.data.map((d) => d[chart.xAxis]),
        datasets: [
          {
            label: chart.yAxis,
            data: chart.data.map((d) => d[chart.yAxis]),
            backgroundColor:
              chart.chartType === 'pie' || chart.chartType === 'doughnut'
                ? backgroundColors
                : chart.chartType === 'bar' || chart.chartType === '3d-column' || chart.chartType === '3d-bar'
                ? backgroundColors
                : 'rgba(54, 162, 235, 0.6)',
            borderColor:
              chart.chartType === 'pie' || chart.chartType === 'doughnut'
                ? borderColors
                : chart.chartType === 'bar' || chart.chartType === '3d-column' || chart.chartType === '3d-bar'
                ? borderColors
                : 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: chart.title },
        },
      },
    });
    return () => {
      chartInstance.destroy();
    };
  }, [chart]);

  return (
    <div className="bg-white rounded shadow p-4">
      <canvas ref={chartRef} />
    </div>
  );
};

const MetricCard = ({ title, value }) => (
  <div className="bg-white rounded shadow p-4 flex flex-col items-center justify-center">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const charts = useSelector((state) => state.chart?.charts || []);
  const uploads = useSelector((state) => state.upload?.uploads || []);
  const loading = useSelector((state) => state.upload?.loading);
  const error = useSelector((state) => state.upload?.error);
  const auth = useSelector((state) => state.auth);
  const adminThemeMode = useSelector((state) => state.adminSettings?.settings?.themeMode);
  const userThemeMode = useSelector((state) => state.userSettings?.settings?.themeMode);
  const user = useSelector((state) => state.auth.user);
  const themeMode = user && user.role === 'admin' ? adminThemeMode : (userThemeMode || 'white');

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileDataPreview, setFileDataPreview] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [selectedUploads, setSelectedUploads] = useState([]);

  useEffect(() => {
    if (!auth.token) {
      navigate('/login');
      return;
    }
    dispatch(fetchUserCharts());
    dispatch(fetchUploadHistory());
  }, [dispatch, auth.token, navigate]);

  // const totalUploads = uploads.length;
  // const totalCharts = charts.length;

  const toggleSelectUpload = (uploadId) => {
    setSelectedUploads((prevSelected) => {
      if (prevSelected.includes(uploadId)) {
        return prevSelected.filter((id) => id !== uploadId);
      } else {
        return [...prevSelected, uploadId];
      }
    });
  };

  const handleDeleteSelectedUploads = () => {
    if (selectedUploads.length === 0) return;
    // Dispatch delete actions for each selected upload
    selectedUploads.forEach((uploadId) => {
      dispatch(deleteUpload(uploadId));
    });
    // Clear selection after deletion
    setSelectedUploads([]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setFilePreview({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
      });

      // Read file content for preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        // Convert array of arrays to array of objects for table preview
        if (data.length > 1) {
          const headers = data[0];
          const rows = data.slice(1);
          const jsonData = rows.map((row) => {
            const obj = {};
            headers.forEach((header, i) => {
              obj[header] = row[i];
            });
            return obj;
          });
          setFileDataPreview(jsonData.slice(0, 10)); // preview first 10 rows
        } else {
          setFileDataPreview([]);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setFilePreview(null);
      setFileDataPreview(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    dispatch(uploadFile(formData)).then((action) => {
      if (uploadFile.fulfilled.match(action)) {
        // Keep the preview after upload
        setSelectedFile(null);
        // Set the summary from the upload response
        if (action.payload && action.payload.summary) {
          setUploadSummary(action.payload.summary);
        } else {
          setUploadSummary(null);
        }
      }
    });
  };

  return (
    <div className={`space-y-6 ${themeMode === 'dark' ? 'bg-gray-900 text-white' : themeMode === 'creative' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white text-black'}`}>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div className={`mt-8 p-4 rounded shadow ${themeMode === 'dark' ? 'bg-gray-800 text-white' : themeMode === 'creative' ? 'bg-purple-700 bg-opacity-80 text-white' : 'bg-white text-black'}`}>
        <h2 className="text-2xl font-semibold mb-4">Upload Excel File</h2>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="mb-4"
        />
        {filePreview && (
          <div className={`mb-4 p-2 border rounded ${themeMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : themeMode === 'creative' ? 'bg-purple-600 bg-opacity-70 border-purple-500 text-white' : 'bg-gray-50 border-gray-300 text-black'}`}>
            <p><strong>File Name:</strong> {filePreview.name}</p>
            <p><strong>File Size:</strong> {filePreview.size}</p>
          </div>
        )}
      {fileDataPreview && <FilePreviewTable data={fileDataPreview} themeMode={themeMode} />}
      {uploadSummary && (
        <div className={`mt-4 p-4 rounded shadow whitespace-pre-wrap ${themeMode === 'dark' ? 'bg-gray-800 text-white font-mono' : 'bg-gray-100 text-black font-mono'}`}>
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <pre className="whitespace-pre-wrap">{uploadSummary.replace(/\\n/g, '\n')}</pre>
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className={`px-4 py-2 rounded text-white ${!selectedFile || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
    {/* Optionally, render charts here if needed */}
    <div className="mt-6">
      {/* Removed Your Charts section as per user request */}
      <UploadHistory uploads={uploads} selectedUploads={selectedUploads} toggleSelectUpload={toggleSelectUpload} handleDeleteSelectedUploads={handleDeleteSelectedUploads} />
    </div>
    </div>
  );
};

export default DashboardPage;
