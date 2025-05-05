// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import userReducer from './user-slice';

const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
