
import {
    FETCH_EXHIBITORS_SUCCESS,
    FETCH_EXHIBITORS
  } from "../../constants/ActionTypes";
  
  const INIT_STATE = {
    exhibitors: [],
    fetched: false,
    loading: false
  };


export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case FETCH_EXHIBITORS_SUCCESS: {
      return {
        ...state,
        exhibitors: action.payload,
        fetched: true
      };
    }

    case FETCH_EXHIBITORS: {
      
      return {
        ...state,
        loading: true
      };
    }

    default:
      return state;
  }
}
