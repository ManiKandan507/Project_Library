import {
  GET_SETTINGS
  } from "../../constants/ActionTypes";

  const INIT_STATE = {};


export default (state = INIT_STATE, action) => {
  switch (action.type) {

    case GET_SETTINGS: {
      return {
        ...state,
        settings: action.payload,
      }
    }
   
    default:
      return state;
  }
}
