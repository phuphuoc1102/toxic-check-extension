import { API_ENDPOINT } from '../../constants/env';
import { logout } from '../../store/auth-slice';
import store from '../../store/store';
import { setAccessToken } from '../../store/user-slice';
import { getItemStorage, setItemStorage } from '../../store/utils';

const baseUrl = API_ENDPOINT;

export const fetchWrapper = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE'),
  patch: request('PATCH'),
};

function request(method: string) {
  return async (url: string, body?: any) => {
    const requestOptions: any = {
      method,
      headers: await authHeader(url),
    };
    if (body) {
      if (body instanceof FormData) {
        requestOptions.body = body;
        // Don't set Content-Type for FormData, browser will set it automatically
      } else {
        requestOptions.headers['Content-Type'] = 'application/json';
        requestOptions.body = JSON.stringify(body);
      }
    }
    const response = await fetch(url, requestOptions);

    return handleResponse({ url, requestOptions }, response);
  };
}

// Helper functions

async function authHeader(url: string) {
  // const accessToken = store.getState().user.accessToken;
  const accessToken = await getItemStorage('access_token');
  const isApiUrl = url.startsWith(baseUrl);
  if (isApiUrl && accessToken) {
    return { Authorization: `Bearer ${accessToken}` };
  } else {
    return {};
  }
}

async function handleResponse(request: any, response: any) {
  const text = await response.text();
  const data = text && JSON.parse(text);
  console.log('handleResponse', data);
  if (!response.ok) {
    let responseT: any = null;

    if ([401, 403].includes(response.status)) {
      const refresh_token = await getItemStorage('refresh_token');

      if (!refresh_token) {
        console.log('LOG: Refresh token not found.');
        store.dispatch(logout());
      } else {
        try {
          responseT = await fetch(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            body: JSON.stringify({ refresh_token }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const refreshData = await getRawResponse(responseT);

          setItemStorage('access_token', refreshData.data.access_token);
          store.dispatch(setAccessToken(refreshData.data.access_token));

          if (responseT.ok) {
            const requestOptions = request.requestOptions;
            const newOption = {
              ...requestOptions,
              headers: authHeader(request.url),
            };
            const retryResponse = await fetch(request.url, newOption);
            return handleResponse(null, retryResponse);
          }
        } catch (error) {
          store.dispatch(logout());

          return Promise.reject(error);
        }
      }
    }

    if (responseT && [401, 403].includes(responseT.status)) {
      store.dispatch(logout());
    }
    const error = {
      status: response.status,
      code: data?.error?.code?.replace('.', '_') ?? '',
      message: data?.error?.message ?? '',
    };
    console.log('fetchWrapper', error);
    return Promise.reject(error);
  }
  console.log('fetchWrapper', data);
  return data;
}

async function getRawResponse(response: any) {
  const text = await response.text();
  const data = text && JSON.parse(text);
  return data;
}
