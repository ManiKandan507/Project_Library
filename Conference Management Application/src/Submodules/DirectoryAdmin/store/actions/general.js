export const requestApi = (api, payload) => ({
  type: `REQUEST-${api}`,
  payload,
});

export const receiveApi = (api, payload) => ({
  type: `RECEIVE-${api}`,
  payload,
});

export const loadingApi = (api, payload) => ({
  type: `LOADING-${api}`,
  payload,
});
