import {
  FETCH_EXHIBITORS,
  FETCH_EXHIBITORS_SUCCESS
} from "../../constants/ActionTypes";


export const fetchExhibitorsRequest = (payload) => {
  return dispatch => dispatch({
    type: FETCH_EXHIBITORS,
    payload: payload
  });
};

export const fetchExhibitorsSuccess = (payload) => {
  return dispatch => dispatch({
        type: FETCH_EXHIBITORS_SUCCESS,
        payload
      });
};
