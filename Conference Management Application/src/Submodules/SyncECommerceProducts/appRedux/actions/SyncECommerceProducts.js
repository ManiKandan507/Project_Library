import {
  FETCH_ERROR,
  REQUEST_PRODUCT_DETAILS,
  RECEIVE_PRODUCT_DETAILS,
  RECEIVE_ABSTRACT_MODULES,
  REQUEST_ABSTRACT_MODULES,
  REQUEST_ABSTRACT_FIELDS,
  RECEIVE_ABSTRACT_FIELDS,
  REQUEST_PRODUCT_DESCENDANTS,
  RECEIVE_PRODUCT_DESCENDANTS,
  REQUEST_SESSION_ABSTRACT_CONFIG,
  RECEIVE_SESSION_ABSTRACT_CONFIG,
  REQUEST_UPDATE_PRODUCTS,
  RECEIVE_UPDATE_PRODUCTS,
  REQUEST_WIZARD_CONFIG,
  RECEIVE_WIZARD_CONFIG,
  REQUEST_MAIN_PRODUCT_DETAILS,
  RECEIVE_MAIN_PRODUCT_DETAILS,
  REQUEST_FIX_FILE_SIZE,
  RECEIVE_FIX_FILE_SIZE,
} from "../../constants/ActionTypes";

export const fetchError = error => {
  return {
    type: FETCH_ERROR,
    payload: error,
  };
};

export const requestMainProductDetails = data => {
  return {
    type: REQUEST_MAIN_PRODUCT_DETAILS,
    payload: data,
  };
};

export const receiveMainProductDetails = data => {
  return {
    type: RECEIVE_MAIN_PRODUCT_DETAILS,
    payload: data,
  };
};

export const requestProductDetails = data => {
  return {
    type: REQUEST_PRODUCT_DETAILS,
    payload: data,
  };
};

export const receiveProductDetails = data => {
  return {
    type: RECEIVE_PRODUCT_DETAILS,
    payload: data,
  };
};

export const requestAbstractModules = data => {
  return {
    type: REQUEST_ABSTRACT_MODULES,
    payload: data,
  };
};

export const receiveAbstractModules = data => {
  return {
    type: RECEIVE_ABSTRACT_MODULES,
    payload: data,
  };
};

export const requestAbstractFields = data => {
  return {
    type: REQUEST_ABSTRACT_FIELDS,
    payload: data,
  };
};

export const receiveAbstractFields = data => {
  return {
    type: RECEIVE_ABSTRACT_FIELDS,
    payload: data,
  };
};

export const requestProductDescendants = data => {
  return {
    type: REQUEST_PRODUCT_DESCENDANTS,
    payload: data,
  };
};

export const receiveProductDescendants = data => {
  return {
    type: RECEIVE_PRODUCT_DESCENDANTS,
    payload: data,
  };
};

export const requestSessionAbstractConfig = data => {
  return {
    type: REQUEST_SESSION_ABSTRACT_CONFIG,
    payload: data,
  };
};
export const receiveSessionAbstractConfig = data => {
  return {
    type: RECEIVE_SESSION_ABSTRACT_CONFIG,
    payload: data,
  };
};
export const requestUpdateProducts = data => {
  return {
    type: REQUEST_UPDATE_PRODUCTS,
    payload: data,
  };
};

export const receiveUpdateProducts = data => {
  return {
    type: RECEIVE_UPDATE_PRODUCTS,
    payload: data,
  };
};

export const requestToWizardConfig = data => {
  return {
    type: REQUEST_WIZARD_CONFIG,
    payload: data
  }
}

export const receiveWizardConfig = data => {
  return {
    type: RECEIVE_WIZARD_CONFIG,
    payload: data
  }
}
export const requestFixFileSize = data => {
  return {
    type: REQUEST_FIX_FILE_SIZE,
    payload: data,
  };
};
  
export const receiveFixFileSize = data => {
  return {
    type: RECEIVE_FIX_FILE_SIZE,
    payload: data,
  };
};