export const requestUpdateDirectory = payload => ({
  type: `REQUEST-UPDATE-DIRECTORY`,
  payload,
});

export const receiveUpdateDirectory = payload => ({
  type: `RECEIVE-UPDATE-DIRECTORY`,
  payload,
});

export const loadingUpdateDirectory = payload => ({
  type: `LOADING-UPDATE-DIRECTORY`,
  payload,
});

export const requestAddDirectory = payload => ({
  type: `REQUEST-ADD-DIRECTORY`,
  payload,
});

export const receiveAddDirectory = payload => ({
  type: `RECEIVE-ADD-DIRECTORY`,
  payload,
});

export const loadingAddDirectory = payload => ({
  type: `LOADING-ADD-DIRECTORY`,
  payload,
});

export const requestRemoveDirectory = payload => ({
  type: `REQUEST-REMOVE-DIRECTORY`,
  payload,
});

export const receiveRemoveDirectory = payload => ({
  type: `RECEIVE-REMOVE-DIRECTORY`,
  payload,
});

export const loadingRemoveDirectory = payload => ({
  type: `LOADING-REMOVE-DIRECTORY`,
  payload,
});

export const setAppDir = payload => ({
  type: "SET_APP_DIR",
  payload,
});

export const setXcdHostedURL = payload => ({
  type: "SET_XCD_HOSTED_URL",
  payload,
});
