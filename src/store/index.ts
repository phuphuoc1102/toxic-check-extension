import {handleBackUpCredentialsKeyFunction} from "@/storage/secure-storage";
import {getUserInfoApi} from "../lib/services/user.service";
import {logout, setLoggedIn, setUser} from "./auth-slice";
import store from "./store";
import {removeAccessToken, setAccessToken} from "./user-slice";
import {getItemStorage, removeItemStorage} from "./utils";

export const initAuthStore = async (email?: string, password?: string) => {
  const access_token = await getItemStorage("access_token");
  chrome.runtime.sendMessage({
    action: "LOG",
  });
  try {
    if (access_token) {
      store.dispatch(setAccessToken(access_token));
      try {
        const user = await getUserInfoApi();
        if (user) {
          store.dispatch(setUser(user.data));
          if (email && password) {
            await handleBackUpCredentialsKeyFunction(
              email,
              password,
              user.data.id,
            );
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
