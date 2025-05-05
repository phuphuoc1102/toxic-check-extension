// store.ts
import {configureStore} from "@reduxjs/toolkit";
import userReducer from "./user-slice";
import authReducer from "./auth-slice";
import itemReducer from "./password-slice";

const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    items: itemReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
