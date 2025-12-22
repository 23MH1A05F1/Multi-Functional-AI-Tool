import React from 'react';
import FilePreviewTable from './FilePreviewTable';

const ExcelPreviewWithSummary = ({ data, summary }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div>
      <FilePreviewTable data={data} />
      {summary && (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default ExcelPreviewWithSummary;
