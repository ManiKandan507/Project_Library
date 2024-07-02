import * as types from "../../constants/ActionTypes";

export const fetchError = (error) => ({ type: types.FETCH_ERROR, payload: error, });

export const requestMenuChange = payload => ({ type: types.REQUEST_MENU_CHANGE, payload});
export const requestCurrentMembers = payload => ({ type: types.REQUEST_CURRENT_MEMBERS, payload});
export const requestRenewingMembers = payload => ({ type: types.REQUEST_RENEWING_MEMBERS, payload});
export const requestNewMembers = payload => ({ type: types.REQUEST_NEW_MEMBERS, payload});
export const requestExpiredMembers = payload => ({ type: types.REQUEST_EXPIRED_MEMBERS, payload});
export const requestExtendedHistory = payload => ({ type: types.REQUEST_EXTENDED_HISTORY, payload});
export const requestSalesActivity = payload => ({ type: types.REQUEST_SALES_ACTIVITY, payload});

export const receiveCurrentMembers = payload => ({ type: types.RECEIVE_CURRENT_MEMBERS, payload});
export const receiveRenewingMembers = payload => ({ type: types.RECEIVE_RENEWING_MEMBERS, payload});
export const receiveNewMembers = payload => ({ type: types.RECEIVE_NEW_MEMBERS, payload});
export const receiveExpiredMembers = payload => ({ type: types.RECEIVE_EXPIRED_MEMBERS, payload});
export const receiveExtendedHistory = payload => ({ type: types.RECEIVE_EXTENDED_HISTORY, payload});
export const receiveSalesActivity = payload => ({ type: types.RECEIVE_SALES_ACTIVITY, payload});
export const receiveMenuChange = payload => ({ type: types.RECEIVE_MENU_CHANGE, payload});

export const getMemberDetailsRequest = payload => ({ type: types.GET_MEMBER_DETAILS_REQUEST, payload });
export const getMemberDetailsSuccess = payload => ({ type: types.GET_MEMBER_DETAILS_SUCCESS, payload });
export const getMemberDetailsFailure = payload => ({ type: types.GET_MEMBER_DETAILS_FAILURE, payload });

export const showModal = payload => ({ type: types.SHOW_MODAL, payload });

export const updateAllMemberDetails = payload => ({ type: types.UPDATE_ALL_MEMBER_DETAILS, payload, });
export const handleAllMembersExport = payload => ({ type: types.HANDLE_ALL_MEMBERS_EXPORT, payload, });

export const fetchLocationCountryRequest = payload => ({ type: types.FETCH_LOCATION_COUNTRY_REQUEST, payload })
export const fetchLocationCountrySuccess = payload => ({ type: types.FETCH_LOCATION_COUNTRY_SUCCESS, payload })
export const fetchLocationCountryFailure = payload => ({ type: types.FETCH_LOCATION_COUNTRY_FAILURE, payload })

export const fetchLocationStateRequest = payload => ({ type: types.FETCH_LOCATION_STATE_REQUEST, payload })
export const fetchLocationStateSuccess = payload => ({ type: types.FETCH_LOCATION_STATE_SUCCESS, payload })
export const fetchLocationStateFailure = payload => ({ type: types.FETCH_LOCATION_STATE_FAILURE, payload })

export const sendEmailRequest = payload => ({ type: types.SEND_EMAIL_REQUEST, payload, });