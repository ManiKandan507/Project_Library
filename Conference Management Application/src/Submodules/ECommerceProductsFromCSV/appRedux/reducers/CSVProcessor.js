/* eslint-disable import/no-anonymous-default-export */
import {
  RECEIVE_ALL_STORES,
  FETCH_ERROR,
  REQUEST_CREATE_PRODUCTS_CSV,
  RECEIVE_CREATE_PRODUCTS_CSV,
} from "../../constants/ActionTypes";
const INIT_STATE = {
  process_completed: false,
  result: {},
  stores: [],
  stores_fetched: false,
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case FETCH_ERROR: {
      //TODO: Handle the error
      return { ...state };
    }

    case RECEIVE_ALL_STORES: {
      return {
        ...state,
        stores: action.payload.data.data,
        stores_fetched: true,
      };
    }

    case REQUEST_CREATE_PRODUCTS_CSV: {
      return {
        ...state,
        process_completed: false,
      }
    }

    case RECEIVE_CREATE_PRODUCTS_CSV: {
      return {
        ...state,
        process_completed: true,
        result: action.payload.data,
      };
    }

    default:
      return state;
  }
};
