import {
    GET_ALL_SESSION,
    GET_ALL_SESSION_SUCCESS,
  } from "../../constants/ActionTypes";

  const INIT_STATE = {
    loading: false,
    loaded: false,
  };


export default (state = INIT_STATE, action) => {
  switch (action.type) {

    case GET_ALL_SESSION: {
      return {
        ...state,
        loading : true,
      }
    }
    case GET_ALL_SESSION_SUCCESS: {
        return {
            ...state,
            loading : false,
            program: action.payload,
            loaded: true
        }
    }
   
    default:
      return state;
  }
}
