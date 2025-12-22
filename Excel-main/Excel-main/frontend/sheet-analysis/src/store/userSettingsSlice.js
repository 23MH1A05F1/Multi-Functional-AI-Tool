import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '') + '/user-settings';

const initialState = {
  settings: {},
  loading: false,
  error: null,
  updateSuccess: false,
};

export const fetchUserSettings = createAsyncThunk(
  'userSettings/fetchUserSettings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data.settings;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch user settings failed');
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'userSettings/updateUserSettings',
  async (settingsData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(API_URL, settingsData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data.settings;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update user settings failed');
    }
  }
);

const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    clearUpdateSuccess(state) {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      });
  },
});

export const { clearUpdateSuccess } = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
