import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uploadReducer from './uploadSlice';

import chartReducer from './chartSlice';
import adminSettingsReducer from './adminSettingsSlice';
import userSettingsReducer from './userSettingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    upload: uploadReducer,
   
    chart: chartReducer,
    adminSettings: adminSettingsReducer,
    userSettings: userSettingsReducer,
  },
});

export default store;
