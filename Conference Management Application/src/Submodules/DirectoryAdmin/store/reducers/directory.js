const initialState = {
  APP_DIR: "",
  XCD_HOSTED_URL: "",
  UPDATE_DIRECTORY_STATUS: "IDLE",
  ADD_DIRECTORY_STATUS: "IDLE",
  REMOVE_DIRECTORY_STATUS: "IDLE",
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case "LOADING-UPDATE-DIRECTORY": {
      return { ...state, UPDATE_DIRECTORY_STATUS: "LOADING" };
    }
    case "RECEIVE-UPDATE-DIRECTORY": {
      return { ...state, UPDATE_DIRECTORY_STATUS: "SUCCESS" };
    }
    case "LOADING-ADD-DIRECTORY": {
      return { ...state, ADD_DIRECTORY_STATUS: "LOADING" };
    }
    case "RECEIVE-ADD-DIRECTORY": {
      return { ...state, ADD_DIRECTORY_STATUS: "SUCCESS" };
    }
    case "LOADING-REMOVE-DIRECTORY": {
      return { ...state, REMOVE_DIRECTORY_STATUS: "LOADING" };
    }
    case "RECEIVE-REMOVE-DIRECTORY": {
      return { ...state, REMOVE_DIRECTORY_STATUS: "SUCCESS" };
    }
    case "SET_APP_DIR": {
      return { ...state, APP_DIR: payload };
    }
    case "SET_XCD_HOSTED_URL": {
      return { ...state, XCD_HOSTED_URL: payload };
    }
    default:
      return state;
  }
};
