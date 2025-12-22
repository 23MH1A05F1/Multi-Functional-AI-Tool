import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '') + '/upload';

const initialState = {
  uploads: [],
  loading: false,
  error: null,
};

// Async thunk for uploading file
export const uploadFile = createAsyncThunk(
  'upload/uploadFile',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data.upload;
    } catch (err) {
      if (err.response?.data?.message?.includes('OpenAI API quota exceeded')) {
        return rejectWithValue('Upload failed due to API quota limits.');
      }
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

// Async thunk for fetching upload history
export const fetchUploadHistory = createAsyncThunk(
  'upload/fetchUploadHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/history`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

// Async thunk for clearing upload history
export const clearUploadHistory = createAsyncThunk(
  'upload/clearUploadHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.delete(`${API_URL}/history`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Clear failed');
    }
  }
);

// Async thunk for deleting an upload by ID
export const deleteUpload = createAsyncThunk(
  'upload/deleteUpload',
  async (uploadId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.delete(`${API_URL}/${uploadId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete upload failed');
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.uploads.unshift(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUploadHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUploadHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.uploads = action.payload;
      })
      .addCase(fetchUploadHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearUploadHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearUploadHistory.fulfilled, (state) => {
        state.loading = false;
        state.uploads = [];
      })
      .addCase(clearUploadHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUpload.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUpload.fulfilled, (state, action) => {
        state.loading = false;
        state.uploads = state.uploads.filter(upload => upload._id !== action.payload);
      })
      .addCase(deleteUpload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default uploadSlice.reducer;
