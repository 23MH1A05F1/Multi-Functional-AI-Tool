import React, { useState } from 'react';
import ExcelPreviewWithSummary from './ExcelPreviewWithSummary';

const ExcelFileUploader = () => {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setData(null);
    setSummary('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // include cookies for auth if needed
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      if (result.upload) {
        setData(result.upload.data);
        setSummary(result.upload.summary);
      } else {
        setError('No upload data received');
      }
    } catch (err) {
      setError(err.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {data && <ExcelPreviewWithSummary data={data} summary={summary} />}
    </div>
  );
};

export default ExcelFileUploader;
