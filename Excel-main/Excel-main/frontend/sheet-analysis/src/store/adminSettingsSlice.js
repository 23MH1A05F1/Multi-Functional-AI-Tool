import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAdminSettings = createAsyncThunk(
  'adminSettings/fetchAdminSettings',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAdminSettings = createAsyncThunk(
  'adminSettings/updateAdminSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminSettingsSlice = createSlice({
  name: 'adminSettings',
  initialState: {
    settings: {},
    loading: false,
    error: null,
    updateSuccess: false,
  },
  reducers: {
    clearUpdateSuccess(state) {
      state.updateSuccess = false;
    },
    setSettings(state, action) {
      state.settings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchAdminSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch admin settings';
      })
      .addCase(updateAdminSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateAdminSettings.fulfilled, (state) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(updateAdminSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update admin settings';
        state.updateSuccess = false;
      });
  },
});

export const { clearUpdateSuccess, setSettings } = adminSettingsSlice.actions;

export default adminSettingsSlice.reducer;
