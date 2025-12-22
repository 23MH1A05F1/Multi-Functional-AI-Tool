import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  savedCharts: [],
};

const localHistorySlice = createSlice({
  name: 'localHistory',
  initialState,
  reducers: {
    addSavedChart: (state, action) => {
      state.savedCharts.unshift(action.payload);
    },
    clearSavedCharts: (state) => {
      state.savedCharts = [];
    },
    deleteSavedCharts: (state, action) => {
      // action.payload is array of chart IDs to delete
      state.savedCharts = state.savedCharts.filter(chart => !action.payload.includes(chart._id));
    },
  },
});

export const { addSavedChart, clearSavedCharts, deleteSavedCharts } = localHistorySlice.actions;

export default localHistorySlice.reducer;
