import React from 'react';
import { useSelector } from 'react-redux';

const UploadHistory = ({ uploads, selectedUploads, toggleSelectUpload, handleDeleteSelectedUploads }) => {
  const user = useSelector((state) => state.auth.user);
  const adminThemeMode = useSelector((state) => state.adminSettings?.settings?.themeMode);

  const userThemeMode = useSelector((state) => state.userSettings?.settings?.themeMode);
  const themeMode = user && user.role === 'admin' ? adminThemeMode : userThemeMode || 'white';

  if (!uploads || uploads.length === 0) {
    return <p>No uploads available.</p>;
  }

  // Defensive check for selectedUploads prop
  if (!selectedUploads) {
    selectedUploads = [];
  }

  // Define theme-based classes with unified dark mode colors
  const containerClass =
    themeMode === 'dark'
      ? 'bg-gray-900 text-white rounded shadow p-4 mt-6'
      : 'bg-white text-black rounded shadow p-4 mt-6';

  const tableClass =
    themeMode === 'dark'
      ? 'w-full table-auto border-collapse border border-gray-700'
      : 'w-full table-auto border-collapse border border-gray-300';

  const thClass =
    themeMode === 'dark'
      ? 'border border-gray-700 px-4 py-2 text-left bg-gray-800'
      : 'border border-gray-300 px-4 py-2 text-left bg-gray-100';

  const trHoverClass =
    themeMode === 'dark'
      ? 'hover:bg-gray-800'
      : 'hover:bg-gray-100';

  const tdClass =
    themeMode === 'dark'
      ? 'border border-gray-700 px-4 py-2'
      : 'border border-gray-300 px-4 py-2';

  return (
    <div className={containerClass}>
      <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
        Upload History
        <button
          onClick={handleDeleteSelectedUploads}
          disabled={selectedUploads.length === 0}
          className={`ml-4 py-1 px-2 rounded text-white ${
            selectedUploads.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Delete Selected
        </button>
      </h3>
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}></th>
            <th className={thClass}>File Name</th>
            <th className={thClass}>Upload Date</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((upload) => (
            <tr key={upload._id} className={trHoverClass}>
              <td className={tdClass}>
                <input
                  type="checkbox"
                  checked={selectedUploads.includes(upload._id)}
                  onChange={() => toggleSelectUpload(upload._id)}
                />
              </td>
              <td className={tdClass}>{upload.filename}</td>
              <td className={tdClass}>{new Date(upload.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UploadHistory;
