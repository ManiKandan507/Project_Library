import {
  all,
  call,
  fork,
  put,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import _isEmpty from "lodash/isEmpty";
import * as types from "../../constants/ActionTypes";
import * as actions from "../actions/Reporting";

import ReportingAPIs from "../../api/reporting";

const fetchMostViewedProductData = async (context) => {
  return await ReportingAPIs.getMostViewedProducts(context.payload)
};

const fetchActiveUsersUid = async (context) => {
  return await ReportingAPIs.getActiveUsersUid(context.payload)
};

const fetchActiveUsersData = async (context) => {
  return await ReportingAPIs.getActiveUsersData(context.payload)
};

const fetchMostViewedFileData = async (context) => {
  return await ReportingAPIs.getMostViewedFiles(context.payload)
};

const fetchInsight = async (context) => {
  return await ReportingAPIs.getInsightdata(context.payload)
};

const fetchMonthlyActiveUserData = async (context) => {
  return await ReportingAPIs.getMonthlyActiveUserData(context.payload)
}

const fetchMonthlyBandwidthData = async (context) => {
  return await ReportingAPIs.getMonthlyBandwidthData(context.payload)
}

const fetchFilesStatisticsData = async (context) => {
  return await ReportingAPIs.getFilesStatisticsData(context.payload)
}

const fetchMonthlyFilesViewData = async (context) => {
  return await ReportingAPIs.getMonthlyFilesViewData(context.payload)
}

const fetchProductViewData = async (context) => {
  return await ReportingAPIs.getProductsViewData(context.payload)
}

const fetchUsersCustomerIdData = async (context) => {
  return await ReportingAPIs.getUsersCustomerId(context.payload)
}

const fetchUserContactDetailsData = async (context) => {
  return await ReportingAPIs.getUserContactDetails(context.payload)
}

function* getMenuChange(action) {
  try {
    yield put(actions.receiveMenuChange(action));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* fetchMostViewedProductSaga(action) {
  try {
    const result = yield call(fetchMostViewedProductData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchMostViewedProductsSuccess({ ...responseData, offset: action.payload.offset }));
    } else {
      yield put(actions.fetchMostViewedProductsFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchMostViewedProductsFailure(err))
  }
}

function* fetchActiveUsersUidSaga(action) {
  try {
    const result = yield call(fetchActiveUsersUid, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchActiveUsersUidSuccess(responseData));
    } else {
      yield put(actions.fetchActiveUsersUidFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchActiveUsersUidFailure(err))
  }
}

function* fetchActiveUsersDataSaga(action) {
  try {
    const result = yield call(fetchActiveUsersData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchActiveUsersDataSuccess(responseData));
    } else {
      yield put(actions.fetchActiveUsersDataFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchActiveUsersDataFailure(err))
  }
}

function* fetchMostViewedFileSaga(action) {
  try {
    const result = yield call(fetchMostViewedFileData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchMostViewedFilesSuccess(responseData));
    } else {
      yield put(actions.fetchMostViewedFilesFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchMostViewedFilesFailure(err))
  }
}

function* fetchInsightDataSaga(action) {
  try {
    const result = yield call(fetchInsight, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchInsightDataSuccess(responseData));
    } else {
      yield put(actions.fetchInsightDataFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchInsightDataFailure(err))
  }
}

function* fetchMonthlyActiveUserSaga(action) {
  try {
    const result = yield call(fetchMonthlyActiveUserData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchMonthlyActiveUsersSuccess(responseData));
    } else {
      yield put(actions.fetchMonthlyActiveUsersFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchMonthlyActiveUsersFailure(err))
  }
}

function* fetchMonthlyBandwidthSaga(action) {
  try {
    const result = yield call(fetchMonthlyBandwidthData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchMonthlyBandwidthDataSuccess(responseData));
    } else {
      yield put(actions.fetchMonthlyBandwidthDataFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchMonthlyBandwidthDataFailure(err))
  }
}

function* fetchFilesStatisticsDataSaga(action) {
  try {
    const result = yield call(fetchFilesStatisticsData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchFilesStatisticsDataSuccess(responseData));
    } else {
      yield put(actions.fetchFilesStatisticsDataFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchFilesStatisticsDataFailure(err))
  }
}

function* fetchMonthlyFilesViewSaga(action) {
  try {
    const result = yield call(fetchMonthlyFilesViewData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchMonthlyFilesDataSuccess(responseData));
    } else {
      yield put(actions.fetchMonthlyFilesDataFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchMonthlyFilesDataFailure(err))
  }
}

function* fetchProductViewSaga(action) {
  try {
    const result = yield call(fetchProductViewData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchProductDataSuccess(responseData));
    } else {
      yield put(actions.fetchProductDataFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchProductDataFailure(err))
  }
}

function* fetchUsersCustomerIdSaga(action) {
  try {
    const result = yield call(fetchUsersCustomerIdData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchUserCustomerIdSuccess(responseData));
    } else {
      yield put(actions.fetchUserCustomerIdFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchUserCustomerIdFailure(err))
  }
}

function* fetchUserContactDetailsSaga(action) {
  try {
    const result = yield call(fetchUserContactDetailsData, action);
    if (result.data.success) {
      let responseData = result.data.data;
      yield put(actions.fetchUserContactDetailsSuccess(responseData));
    } else {
      yield put(actions.fetchUserContactDetailsFailure(result))
    }
  } catch (err) {
    yield put(actions.fetchUserContactDetailsFailure(err))
  }
}

export function* requestMenuChange() {
  yield takeLatest(types.REQUEST_MENU_CHANGE, getMenuChange);
}
export function* fetchMostViewedProduct() {
  yield takeLatest(types.FETCH_MOST_VIEWED_PRODUCTS_REQUEST, fetchMostViewedProductSaga);
}
export function* fetchActiveUserUid() {
  yield takeLatest(types.FETCH_ACTIVE_USERS_UID_REQUEST, fetchActiveUsersUidSaga);
}
export function* fetchActiveUserData() {
  yield takeLatest(types.FETCH_ACTIVE_USERS_DATA_REQUEST, fetchActiveUsersDataSaga);
}
export function* fetchMostViewedFile() {
  yield takeLatest(types.FETCH_MOST_VIEWED_FILES_REQUEST, fetchMostViewedFileSaga);
}
export function* fetchInsightData() {
  yield takeLatest(types.FETCH_INSIGHTS_DATA_REQUEST, fetchInsightDataSaga);
}
export function* fetchMonthlyActiveUser() {
  yield takeLatest(types.FETCH_MONTHLY_ACTIVE_USERS_REQUEST, fetchMonthlyActiveUserSaga);
}
export function* fetchMonthlyBandwidth() {
  yield takeLatest(types.FETCH_MONTHLY_BANDWIDTH_DATA_REQUEST, fetchMonthlyBandwidthSaga);
}
export function* fetchFilesStatistics() {
  yield takeLatest(types.FETCH_FILES_STATISTICS_DATA_REQUEST, fetchFilesStatisticsDataSaga);
}
export function* fetchMonthlyFilesView() {
  yield takeLatest(types.FETCH_MONTHLY_FILE_VIEWS_REQUEST, fetchMonthlyFilesViewSaga);
}
export function* fetchProductView() {
  yield takeLatest(types.FETCH_PRODUCT_VIEWS_BY_USER_REQUEST, fetchProductViewSaga);
}
export function* fetchUsersCustomerId() {
  yield takeLatest(types.FETCH_USER_CUSTOMER_ID_REQUEST, fetchUsersCustomerIdSaga);
}
export function* fetchUserContactDetails() {
  yield takeLatest(types.FETCH_USER_CONTACT_DETAILS_REQUEST, fetchUserContactDetailsSaga);
}

export default function* mySaga() {
  yield all([
    fork(requestMenuChange),
    fork(fetchMostViewedProduct),
    fork(fetchActiveUserUid),
    fork(fetchActiveUserData),
    fork(fetchMostViewedFile),
    fork(fetchInsightData),
    fork(fetchMonthlyActiveUser),
    fork(fetchMonthlyBandwidth),
    fork(fetchFilesStatistics),
    fork(fetchMonthlyFilesView),
    fork(fetchProductView),
    fork(fetchUsersCustomerId),
    fork(fetchUserContactDetails)
  ]);
}
