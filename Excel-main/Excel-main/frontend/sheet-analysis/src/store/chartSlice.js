import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '') + '/chart';

const initialState = {
  charts: [],
  loading: false,
  error: null,
};

export const saveChart = createAsyncThunk(
  'chart/saveChart',
  async (chartData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(API_URL, chartData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data.chart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Save chart failed');
    }
  }
);

export const fetchUserCharts = createAsyncThunk(
  'chart/fetchUserCharts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data.charts;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch charts failed');
    }
  }
);

// New thunk to delete a chart by ID
export const deleteChart = createAsyncThunk(
  'chart/deleteChart',
  async (chartId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await axios.delete(`${API_URL}/${chartId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return chartId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete chart failed');
    }
  }
);

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveChart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveChart.fulfilled, (state, action) => {
        state.loading = false;
        state.charts.unshift(action.payload);
      })
      .addCase(saveChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserCharts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCharts.fulfilled, (state, action) => {
        state.loading = false;
        state.charts = action.payload;
      })
      .addCase(fetchUserCharts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteChart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChart.fulfilled, (state, action) => {
        state.loading = false;
        state.charts = state.charts.filter(chart => chart._id !== action.payload);
      })
      .addCase(deleteChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default chartSlice.reducer;
