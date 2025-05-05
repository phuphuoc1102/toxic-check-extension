import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserInfo } from "../model/user";
import { removeItemStorage } from './utils';

interface AuthState {
    user: IUserInfo | null;
    isLoggedIn: boolean;
}

const initialState: AuthState = {
    user: null,
    isLoggedIn: false,
  };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload;
        },
        setUser: (state, action: PayloadAction<IUserInfo>) => {
            state.user = action.payload;
            state.isLoggedIn = true;
        },
        removeUser: state => {
            state.user = null;
            state.isLoggedIn = false;
        },
        logout: state => {
            removeItemStorage('access_token');
            removeItemStorage('refresh_token');
            state.user = null;
            state.isLoggedIn = false;
        }
    },
});

export const { setLoggedIn, setUser, removeUser, logout } = authSlice.actions;
export default authSlice.reducer;