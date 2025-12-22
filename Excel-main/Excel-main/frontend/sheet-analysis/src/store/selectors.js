import { createSelector } from '@reduxjs/toolkit';

export const selectUploads = createSelector(
  (state) => state.upload.uploads,
  (uploads) => uploads || []
);

export const selectUserCharts = createSelector(
  (state) => state.chart.charts,
  (charts) => charts || []
);

export const selectSavedCharts = createSelector(
  (state) => state.localHistory,
  (localHistory) => (localHistory ? localHistory.savedCharts : [])
);
