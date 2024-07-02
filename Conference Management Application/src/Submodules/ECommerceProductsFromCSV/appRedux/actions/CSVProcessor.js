import {
  FETCH_ERROR,
  REQUEST_ALL_STORES,
  RECEIVE_ALL_STORES,
  REQUEST_CREATE_PRODUCTS_CSV,
  RECEIVE_CREATE_PRODUCTS_CSV,
} from "../../constants/ActionTypes";

export const fetchError = error => {
  return {
    type: FETCH_ERROR,
    payload: error,
  };
};

export const requestStores = data => {
  return {
    type: REQUEST_ALL_STORES,
    payload: data,
  };
};

export const receiveStores = data => {
  return {
    type: RECEIVE_ALL_STORES,
    payload: data,
  };
};

export const requestCreateProductsCSV = data => {
  return {
    type: REQUEST_CREATE_PRODUCTS_CSV,
    payload: data,
  };
};

export const receiveCreateProductsCSV = data => {
  return {
    type: RECEIVE_CREATE_PRODUCTS_CSV,
    payload: data,
  };
};
