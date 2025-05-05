import { getUserInfoApi } from '../lib/services/user.service';
import { logout, setUser } from './auth-slice';
import store from './store';
import { removeAccessToken, setAccessToken } from './user-slice';
import { getItemStorage } from './utils';

export const initAuthStore = async (email?: string, password?: string) => {
  const access_token = await getItemStorage('access_token');
  chrome.runtime.sendMessage({
    action: 'LOG',
  });
  try {
    if (access_token) {
      store.dispatch(setAccessToken(access_token));
      try {
        const user = await getUserInfoApi();
        if (user) {
          store.dispatch(setUser(user.data));
          if (email && password) {
            console.log('email', 'password', email, password);
          }
        }
      } catch (error) {
        console.log(error);
        store.dispatch(logout());
        store.dispatch(removeAccessToken());
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default initAuthStore;
