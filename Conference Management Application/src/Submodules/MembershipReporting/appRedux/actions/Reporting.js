import * as types from "../../constants/ActionTypes";

export const fetchError = (error) => {
  return {
    type: types.FETCH_ERROR,
    payload: error,
  };
};

export const requestCurrentMembers = (data) => {
  return {
    type: types.REQUEST_CURRENT_MEMBERS,
    payload: data,
  };
};

export const receiveCurrentMembers = (data) => {
  return {
    type: types.RECEIVE_CURRENT_MEMBERS,
    payload: data,
  };
};

export const requestRenewingMembers = (data) => {
  return {
    type: types.REQUEST_RENEWING_MEMBERS,
    payload: data,
  };
};

export const receiveRenewingMembers = (data) => {
  return {
    type: types.RECEIVE_RENEWING_MEMBERS,
    payload: data,
  };
};

export const requestNewMembers = (data) => {
  return {
    type: types.REQUEST_NEW_MEMBERS,
    payload: data,
  };
};

export const receiveNewMembers = (data) => {
  return {
    type: types.RECEIVE_NEW_MEMBERS,
    payload: data,
  };
};

export const requestExpiredMembers = (data) => {
  return {
    type: types.REQUEST_EXPIRED_MEMBERS,
    payload: data,
  };
};

export const receiveExpiredMembers = (data) => {
  return {
    type: types.RECEIVE_EXPIRED_MEMBERS,
    payload: data,
  };
};

export const requestExtendedHistory = (data) => {
  return {
    type: types.REQUEST_EXTENDED_HISTORY,
    payload: data,
  };
};

export const receiveExtendedHistory = (data) => {
  return {
    type: types.RECEIVE_EXTENDED_HISTORY,
    payload: data,
  };
};

export const requestMemberTransition = (data) => {
  return {
    type: types.REQUEST_MEMBER_TRANSITION,
    payload: data,
  };
};

export const receiveMemberTransition = (data) => {
  return {
    type: types.RECEIVE_MEMBER_TRANSITION,
    payload: data,
  };
};

export const requestSalesActivity = (data) => {
  return {
    type: types.REQUEST_SALES_ACTIVITY,
    payload: data,
  };
};

export const receiveSalesActivity = (data) => {
  return {
    type: types.RECEIVE_SALES_ACTIVITY,
    payload: data,
  };
};

export const requestMenuChange = (data) => {
  return {
    type: types.REQUEST_MENU_CHANGE,
    payload: data,
  };
};

export const receiveMenuChange = (data) => {
  return {
    type: types.RECEIVE_MENU_CHANGE,
    payload: data,
  };
};

export const getMemberDetailsRequest = payload => ({
  type: types.GET_MEMBER_DETAILS_REQUEST,
  payload
})
export const getMemberDetailsSuccess = payload => ({
  type: types.GET_MEMBER_DETAILS_SUCCESS,
  payload
})
export const getMemberDetailsFailure = payload => ({
  type: types.GET_MEMBER_DETAILS_FAILURE,
  payload
})

export const showModal = payload => ({
  type: types.SHOW_MODAL,
  payload
})

export const updateAllMemberDetails = payload => ({
  type: types.UPDATE_ALL_MEMBER_DETAILS,
  payload,
});

export const handleAllMembersExport = payload => ({
  type: types.HANDLE_ALL_MEMBERS_EXPORT,
  payload,
});

export const fetchLocationCountryRequest = payload => ({
  type: types.FETCH_LOCATION_COUNTRY_REQUEST,
  payload
})
export const fetchLocationCountrySuccess = payload => ({
  type: types.FETCH_LOCATION_COUNTRY_SUCCESS,
  payload
})
export const fetchLocationCountryFailure = payload => ({
  type: types.FETCH_LOCATION_COUNTRY_FAILURE,
  payload
})

export const fetchLocationStateRequest = payload => ({
  type: types.FETCH_LOCATION_STATE_REQUEST,
  payload
})
export const fetchLocationStateSuccess = payload => ({
  type: types.FETCH_LOCATION_STATE_SUCCESS,
  payload
})
export const fetchLocationStateFailure = payload => ({
  type: types.FETCH_LOCATION_STATE_FAILURE,
  payload
})
export const sendEmailRequest = payload => ({
  type: types.SEND_EMAIL_REQUEST,
  payload,
});