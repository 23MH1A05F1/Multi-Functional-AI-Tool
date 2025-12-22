import React from 'react';
import { useSelector } from 'react-redux';

const FilePreviewTable = ({ data }) => {
  const user = useSelector((state) => state.auth.user);
  const adminThemeMode = useSelector((state) => state.adminSettings?.settings?.themeMode);
  const userThemeMode = useSelector((state) => state.userSettings?.settings?.themeMode);

  const themeMode = user && user.role === 'admin' ? adminThemeMode : userThemeMode || 'white';

  if (!data || data.length === 0) {
    return null;
  }

  const columns = Object.keys(data[0]);

  // Define theme-based classes with unified dark mode colors
  const containerClass =
    themeMode === 'dark'
      ? 'overflow-x-auto mt-4 bg-gray-900 text-white rounded shadow p-4'
      : 'overflow-x-auto mt-4 bg-white text-black rounded shadow p-4';

  const tableClass =
    themeMode === 'dark'
      ? 'min-w-full border-collapse border border-gray-700'
      : 'min-w-full border-collapse border border-gray-300';

  const thClass =
    themeMode === 'dark'
      ? 'border border-gray-700 px-4 py-2 text-left bg-gray-800 text-white'
      : 'border border-gray-300 px-4 py-2 text-left bg-gray-100 text-black';

  const trHoverClass =
    themeMode === 'dark'
      ? 'hover:bg-gray-800'
      : 'hover:bg-gray-100';

  const tdClass =
    themeMode === 'dark'
      ? 'border border-gray-700 px-4 py-2 text-white'
      : 'border border-gray-300 px-4 py-2 text-black';

  return (
    <div className={containerClass}>
      <table className={tableClass}>
        <thead>
          <tr className={themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}>
            {columns.map((col) => (
              <th key={col} className={thClass}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={trHoverClass}>
              {columns.map((col) => (
                <td key={col} className={tdClass}>
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FilePreviewTable;
