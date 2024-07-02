import {
    GET_ALL_SESSION,
    GET_ALL_SESSION_SUCCESS,
  } from "../../constants/ActionTypes";
  

  export const fetchSessions = (config) => {
    return {
      type: GET_ALL_SESSION,
      config: config
    };
  };
  
  export const fetchSesssionsSuccess = (sessionList) => {
    return {
      type: GET_ALL_SESSION_SUCCESS,
      payload: sessionList
    }
  };

