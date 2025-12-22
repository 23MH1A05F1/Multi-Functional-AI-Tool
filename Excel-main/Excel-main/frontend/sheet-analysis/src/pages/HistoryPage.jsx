import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UploadHistory from '../components/UploadHistory';
import { fetchUploadHistory, deleteUpload } from '../store/uploadSlice';
import { fetchUserCharts, deleteChart } from '../store/chartSlice';
import jsPDF from 'jspdf';

const HistoryPage = () => {
  const dispatch = useDispatch();
  const uploads = useSelector((state) => state.upload?.uploads || []);
  const loading = useSelector((state) => state.upload?.loading);
  const error = useSelector((state) => state.upload?.error);
  const chartsLoading = useSelector((state) => state.chart.loading);
  const chartsError = useSelector((state) => state.chart.error);
  const savedCharts = useSelector((state) => state.chart?.charts || []);
  const user = useSelector((state) => state.auth.user);
  const adminThemeMode = useSelector((state) => state.adminSettings?.settings?.themeMode);
  const userThemeMode = useSelector((state) => state.userSettings?.settings?.themeMode);

  const themeMode = user && user.role === 'admin' ? adminThemeMode : userThemeMode || 'white';

  const [selectedCharts, setSelectedCharts] = useState([]);
  const [selectedUploads, setSelectedUploads] = useState([]);

  const [modalChartIndex, setModalChartIndex] = useState(null);

  useEffect(() => {
    dispatch(fetchUploadHistory());
    dispatch(fetchUserCharts());
  }, [dispatch]);

  const sanitizeFileName = (name) => {
    return name.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  };

  const downloadChartAsPNG = (chart) => {
    if (!chart.chartImage) {
      alert('No chart image available to download.');
      return;
    }
    const title = sanitizeFileName(chart.title || 'chart');
    const chartType = sanitizeFileName(chart.chartType || 'type');
    const xAxis = sanitizeFileName(chart.xAxis || 'xaxis');
    const yAxis = sanitizeFileName(chart.yAxis || 'yaxis');
    const fileName = `${title}_${chartType}_${xAxis}_${yAxis}.png`;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = chart.chartImage;

    image.onload = () => {
      const textHeight = 80;
      canvas.width = image.width;
      canvas.height = image.height + textHeight;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(image, 0, textHeight);

      ctx.fillStyle = '#FF0000';
      ctx.font = '16px Arial';
      ctx.textBaseline = 'top';

      ctx.fillText(`Title: ${chart.title || ''}`, 10, 10);
      ctx.fillText(`Chart Type: ${chart.chartType || ''}`, 10, 30);
      ctx.fillText(`X-Axis: ${chart.xAxis || ''}`, 10, 50);
      ctx.fillText(`Y-Axis: ${chart.yAxis || ''}`, 10, 70);

      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  const downloadChartAsPDF = (chart) => {
    if (!chart.chartImage) {
      alert('No chart image available to download.');
      return;
    }
    const title = sanitizeFileName(chart.title || 'chart');
    const chartType = sanitizeFileName(chart.chartType || 'type');
    const xAxis = sanitizeFileName(chart.xAxis || 'xaxis');
    const yAxis = sanitizeFileName(chart.yAxis || 'yaxis');
    const fileName = `${title}_${chartType}_${xAxis}_${yAxis}.pdf`;

    const pdf = new jsPDF();

    pdf.setFontSize(12);
    pdf.setTextColor(255, 0, 0);
    pdf.text(`Title: ${chart.title || ''}`, 10, 10);
    pdf.text(`Chart Type: ${chart.chartType || ''}`, 10, 20);
    pdf.text(`X-Axis: ${chart.xAxis || ''}`, 10, 30);
    pdf.text(`Y-Axis: ${chart.yAxis || ''}`, 10, 40);

    pdf.addImage(chart.chartImage, 'PNG', 10, 50, 180, 100);

    pdf.save(fileName);
  };

  const toggleSelectChart = (chartId) => {
    // Close modal if open before toggling selection to prevent modal opening while deleting
    if (modalChartIndex !== null) {
      setModalChartIndex(null);
    }
    setSelectedCharts((prevSelected) =>
      prevSelected.includes(chartId)
        ? prevSelected.filter((id) => id !== chartId)
        : [...prevSelected, chartId]
    );
  };

  const handleDeleteSelectedCharts = () => {
    if (selectedCharts.length === 0) {
      alert('Please select at least one chart to delete.');
      return;
    }
    // Close modal if open before deleting
    if (modalChartIndex !== null) {
      setModalChartIndex(null);
    }
    selectedCharts.forEach((chartId) => {
      dispatch(deleteChart(chartId));
    });
    setSelectedCharts([]);
  };

  const toggleSelectUpload = (uploadId) => {
    setSelectedUploads((prevSelected) =>
      prevSelected.includes(uploadId)
        ? prevSelected.filter((id) => id !== uploadId)
        : [...prevSelected, uploadId]
    );
  };

  const handleDeleteSelectedUploads = () => {
    if (selectedUploads.length === 0) {
      alert('Please select at least one upload to delete.');
      return;
    }
    selectedUploads.forEach((uploadId) => {
      dispatch(deleteUpload(uploadId));
    });
    setSelectedUploads([]);
  };

  const openChartModal = (index) => {
    setModalChartIndex(index);
  };

  const closeChartModal = () => {
    setModalChartIndex(null);
  };

  const handlePrevChart = (e) => {
    e.stopPropagation();
    setModalChartIndex((prev) => (prev === 0 ? savedCharts.length - 1 : prev - 1));
  };

  const handleNextChart = (e) => {
    e.stopPropagation();
    setModalChartIndex((prev) => (prev === savedCharts.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`p-6 ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <h1 className="text-3xl font-bold mb-4">Upload History</h1>
      {error && <p className="text-red-600">{error}</p>}
      {chartsError && <p className="text-red-600">{chartsError}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <UploadHistory
            uploads={uploads}
            selectedUploads={selectedUploads}
            toggleSelectUpload={toggleSelectUpload}
            handleDeleteSelectedUploads={handleDeleteSelectedUploads}
          />
          <h2 className="text-2xl font-semibold mt-8 mb-4 flex items-center justify-between">
            Saved Charts History
            <button
              onClick={handleDeleteSelectedCharts}
              disabled={selectedCharts.length === 0}
              className={`ml-4 py-1 px-2 rounded text-white ${
                selectedCharts.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Delete Selected
            </button>
          </h2>
          {chartsLoading ? (
            <p>Loading saved charts...</p>
          ) : savedCharts.length === 0 ? (
            <p>No saved charts available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCharts.map((chart, index) => (
                <div
                  key={chart._id}
                  className={`border rounded-lg p-4 shadow hover:shadow-lg transition duration-300 cursor-pointer ${
                    selectedCharts.includes(chart._id) ? 'ring-4 ring-red-400' : ''
                  }`}
                  onClick={() => openChartModal(index)}
                >
                  <label className="flex items-center mb-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedCharts.includes(chart._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectChart(chart._id);
                      }}
                      className="mr-2"
                    />
                    <strong className="mt-2 max-h-48 overflow-auto text-xs bg-gray-100 p-2 rounded">{chart.title}</strong>
                  </label>
                  <p className="mb-2">File Name: {chart.fileName}</p>
                  <p className="mb-2">Chart Type: {chart.chartType}</p>
                  <p className="mb-2">X-Axis: {chart.xAxis}</p>
                  <p className="mb-2">Y-Axis: {chart.yAxis}</p>
                  {chart.chartImage && (
                    <img src={chart.chartImage} alt={chart.title} className="w-full h-48 object-contain rounded" />
                  )}
                  {chart.data && (
                    <pre className="mt-2 max-h-48 overflow-auto text-xs bg-gray-100 p-2 rounded">{JSON.stringify(chart.data, null, 2)}</pre>
                  )}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadChartAsPNG(chart);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                    >
                      Download as PNG
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadChartAsPDF(chart);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    >
                      Download as PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {modalChartIndex !== null && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              onClick={closeChartModal}
            >
              <div
                className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-full overflow-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4">{savedCharts[modalChartIndex].title}</h2>
                <p>File Name: {savedCharts[modalChartIndex].fileName}</p>
                <p>Chart Type: {savedCharts[modalChartIndex].chartType}</p>
                <p>X-Axis: {savedCharts[modalChartIndex].xAxis}</p>
                <p>Y-Axis: {savedCharts[modalChartIndex].yAxis}</p>
                {savedCharts[modalChartIndex].chartImage && (
                  <img
                    src={savedCharts[modalChartIndex].chartImage}
                    alt={savedCharts[modalChartIndex].title}
                    className="w-full h-64 object-contain rounded"
                  />
                )}
                {savedCharts[modalChartIndex].data && (
                  <pre className="mt-2 max-h-48 overflow-auto text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(savedCharts[modalChartIndex].data, null, 2)}
                  </pre>
                )}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePrevChart}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextChart}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next
                  </button>
                  <button
                    onClick={closeChartModal}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
