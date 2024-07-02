import * as types from "../../constants/ActionTypes";

export const fetchError = (error) => {
  return {
    type: types.FETCH_ERROR,
    payload: error,
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

export const showModal = payload => ({
  type: types.SHOW_MODAL,
  payload
})

export const handleAllMembersExport = payload => ({
  type: types.HANDLE_ALL_MEMBERS_EXPORT,
  payload,
});
export const sendEmailRequest = payload => ({
  type: types.SEND_EMAIL_REQUEST,
  payload,
});
export const fetchMostViewedProductsRequest = payload => ({
  type: types.FETCH_MOST_VIEWED_PRODUCTS_REQUEST,
  payload
})
export const fetchMostViewedProductsSuccess = payload => ({
  type: types.FETCH_MOST_VIEWED_PRODUCTS_SUCCESS,
  payload
})
export const fetchMostViewedProductsFailure = payload => ({
  type: types.FETCH_MOST_VIEWED_PRODUCTS_FAILURE,
  payload
})
export const fetchActiveUsersUidRequest = payload => ({
  type: types.FETCH_ACTIVE_USERS_UID_REQUEST,
  payload
})
export const fetchActiveUsersUidSuccess = payload => ({
  type: types.FETCH_ACTIVE_USERS_UID_SUCCESS,
  payload
})
export const fetchActiveUsersUidFailure = payload => ({
  type: types.FETCH_ACTIVE_USERS_UID_FAILURE,
  payload
})
export const fetchActiveUsersDataRequest = payload => ({
  type: types.FETCH_ACTIVE_USERS_DATA_REQUEST,
  payload
})
export const fetchActiveUsersDataSuccess = payload => ({
  type: types.FETCH_ACTIVE_USERS_DATA_SUCCESS,
  payload
})
export const fetchActiveUsersDataFailure = payload => ({
  type: types.FETCH_ACTIVE_USERS_DATA_FAILURE,
  payload
})
export const fetchMostViewedFilesRequest = payload => ({
  type: types.FETCH_MOST_VIEWED_FILES_REQUEST,
  payload
})
export const fetchMostViewedFilesSuccess = payload => ({
  type: types.FETCH_MOST_VIEWED_FILES_SUCCESS,
  payload
})
export const fetchMostViewedFilesFailure = payload => ({
  type: types.FETCH_MOST_VIEWED_FILES_FAILURE,
  payload
})
export const fetchInsightDataRequest = payload => ({
  type: types.FETCH_INSIGHTS_DATA_REQUEST,
  payload
}
)
export const fetchInsightDataSuccess = payload => ({
  type: types.FETCH_INSIGHTS_DATA_SUCCESS,
  payload
})
export const fetchInsightDataFailure = payload => ({
  type: types.FETCH_INSIGHTS_DATA_FAILURE,
  payload
})

export const fetchMonthlyActiveUsersRequest = payload => {
  return {
    type: types.FETCH_MONTHLY_ACTIVE_USERS_REQUEST,
    payload
  }
}

export const fetchMonthlyActiveUsersSuccess = payload => {
  return {
    type: types.FETCH_MONTHLY_ACTIVE_USERS_SUCCESS,
    payload
  }
}

export const fetchMonthlyActiveUsersFailure = payload => ({
  type: types.FETCH_MONTHLY_ACTIVE_USERS_FAILURE,
  payload
})

export const fetchMonthlyBandwidthDataRequest = payload => {
  return {
    type: types.FETCH_MONTHLY_BANDWIDTH_DATA_REQUEST,
    payload
  }
}

export const fetchMonthlyBandwidthDataSuccess = payload => {
  return {
    type: types.FETCH_MONTHLY_BANDWIDTH_DATA_SUCCESS,
    payload
  }
}

export const fetchMonthlyBandwidthDataFailure = payload => ({
  type: types.FETCH_MONTHLY_BANDWIDTH_DATA_FAILURE,
  payload
})

export const fetchFilesStatisticsDataRequest = payload => {
  return {
    type: types.FETCH_FILES_STATISTICS_DATA_REQUEST,
    payload
  }
}

export const fetchFilesStatisticsDataSuccess = payload => {
  return {
    type: types.FETCH_FILES_STATISTICS_DATA_SUCCESS,
    payload
  }
}

export const fetchFilesStatisticsDataFailure = payload => {
  return {
    type: types.FETCH_FILES_STATISTICS_DATA_FAILURE,
    payload
  }
}

export const fetchMonthlyFilesDataRequest = payload => {
  return {
    type: types.FETCH_MONTHLY_FILE_VIEWS_REQUEST,
    payload
  }
}

export const fetchMonthlyFilesDataSuccess = payload => {
  return {
    type: types.FETCH_MONTHLY_FILE_VIEWS_SUCCESS,
    payload
  }
}

export const fetchMonthlyFilesDataFailure = payload => {
  return {
    type: types.FETCH_MONTHLY_FILE_VIEWS_FAILURE,
    payload
  }
}

export const fetchProductDataRequest = payload => {
  return {
    type: types.FETCH_PRODUCT_VIEWS_BY_USER_REQUEST,
    payload
  }
}

export const fetchProductDataSuccess = payload => {
  return {
    type: types.FETCH_PRODUCT_VIEWS_BY_USER_SUCCESS,
    payload
  }
}

export const fetchProductDataFailure = payload => {
  return {
    type: types.FETCH_PRODUCT_VIEWS_BY_USER_FAILURE,
    payload
  }
}

export const fetchUserCustomerIdRequest = payload => {
  return {
    type: types.FETCH_USER_CUSTOMER_ID_REQUEST,
    payload
  }
}

export const fetchUserCustomerIdSuccess = payload => {
  return {
    type: types.FETCH_USER_CUSTOMER_ID_SUCCESS,
    payload
  }
}

export const fetchUserCustomerIdFailure = payload => {
  return {
    type: types.FETCH_USER_CUSTOMER_ID_FAILURE,
    payload
  }
}
export const fetchUserContactDetailsRequest = payload => {
  return {
    type: types.FETCH_USER_CONTACT_DETAILS_REQUEST,
    payload
  }
}

export const fetchUserContactDetailsSuccess = payload => {
  return {
    type: types.FETCH_USER_CONTACT_DETAILS_SUCCESS,
    payload
  }
}

export const fetchUserContactDetailsFailure = payload => {
  return {
    type: types.FETCH_USER_CONTACT_DETAILS_FAILURE,
    payload
  }
}