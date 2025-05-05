import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  accessToken: string | null;
}

const initialState: UserState = {
  accessToken: null,
};


// export const logout = createAsyncThunk('user/logout', async (_, { dispatch }) => {
//   await removeItemStorage('access_token');
//   await removeItemStorage('refresh_token');
//   dispatch(removeAccessToken());
// });

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    removeAccessToken: state => {
      state.accessToken = null;
    },
  },
});

export const { setAccessToken, removeAccessToken } = userSlice.actions;
export default userSlice.reducer;