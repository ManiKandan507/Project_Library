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
import { CURRENT_MEMBERS_SCREEN, EXPIRED_MEMBERS_SCREEN, NEW_MEMBERS_SCREEN, RENEWING_MEMBERS_SCREEN, SALES_ACTIVITY_SCREEN, TRANSITION_SCREEN, TREND_SCREEN } from "../../constants";

const fetchCurrentMembers = async (context) => {
  return await ReportingAPIs.getCurrentMembersInfo(context.payload);
};

const fetchRenewingMembers = async (context) => {
  return await ReportingAPIs.getRenewingMembersInfo(context.payload);
};

const fetchNewMembers = async (context) => {
  return await ReportingAPIs.getNewMembersInfo(context.payload)
};

const fetchExpiredMembers = async (context) => {
  return await ReportingAPIs.getExpiredMembersInfo(context.payload)
};

const fetchExtendedHistory = async (context) => {
  return await ReportingAPIs.getExtendedHistoryInfo(
    context.payload.sourceHex,
    context.payload.groupid,
    context.payload.start_date,
    context.payload.end_date
  );
};

const fetchMemberTransition = async (context) => {
  return await ReportingAPIs.getMemberTransitionInfo(
    context.payload.sourceHex,
    context.payload.groupid,
    context.payload.start_date,
    context.payload.end_date
  );
};

const fetchSalesActivity = async (context) => {
  return await ReportingAPIs.getSalesActivityInfo(context.payload)
};

const fetchMemberInfoByUuids = async (context) => {
  return await ReportingAPIs.getMembersInfoByUuids(context.payload)
};

const fetchLocation = async (context) => {
  return await ReportingAPIs.getLocationDetails(context.payload)
};

const matchedScreenApi = async (context) => {
  if (context.payload.screen === CURRENT_MEMBERS_SCREEN) {
    return fetchCurrentMembers(context)
  } else if (context.payload.screen === EXPIRED_MEMBERS_SCREEN) {
    return fetchExpiredMembers(context)
  } else if (context.payload.screen === NEW_MEMBERS_SCREEN) {
    return fetchNewMembers(context)
  } else if (context.payload.screen === RENEWING_MEMBERS_SCREEN) {
    return fetchRenewingMembers(context)
  } else if (context.payload.screen === TREND_SCREEN || context.payload.screen === TRANSITION_SCREEN || context.payload.screen === SALES_ACTIVITY_SCREEN) {
    return fetchMemberInfoByUuids(context)
  } else {
    return fetchCurrentMembers(context)
  }
}
function* getCurrentMembers(action) {
  try {
    const result = yield call(fetchCurrentMembers, action);
    yield put(actions.receiveCurrentMembers(result));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* getRenewingMembers(action) {
  try {
    const result = yield call(fetchRenewingMembers, action);
    yield put(actions.receiveRenewingMembers(result));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* getNewMembers(action) {
  try {
    const result = yield call(fetchNewMembers, action);
    yield put(actions.receiveNewMembers(result));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* getExpiredMembers(action) {
  try {
    const result = yield call(fetchExpiredMembers, action);
    yield put(actions.receiveExpiredMembers(result));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* getExtendedHistory(action) {
  try {
    const result = yield call(fetchExtendedHistory, action);
    yield put(actions.receiveExtendedHistory(result));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* getMemberTransition(action) {
  try {
    const result = yield call(fetchMemberTransition, action);
    yield put(actions.receiveMemberTransition(result));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* getSalesActivity(action) {
  try {
    const result = yield call(fetchSalesActivity, action);
    yield put(actions.receiveSalesActivity(result));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* getMenuChange(action) {
  try {
    yield put(actions.receiveMenuChange(action));
  } catch (e) {
    yield put(actions.fetchError(e));
  }
}

function* fetchMemberInfoSaga(action) {
  try {
    const result = yield call(matchedScreenApi, action);
    if (result.success) {
      if (action.payload.exportCSV) {
        yield put(actions.updateAllMemberDetails(result));
        yield put(actions.handleAllMembersExport(true));
      } else if (action.payload.sendEmail) {
        yield put(actions.updateAllMemberDetails(result));
        yield put(actions.sendEmailRequest(true))
      }
      else {
        yield put(actions.getMemberDetailsSuccess(result));
        yield put(actions.showModal(true));
      }
    } else {
      yield put(actions.getMemberDetailsFailure(result))
    }
  } catch (err) {
    yield put(actions.getMemberDetailsFailure(err))
  }
}

function* fetchLocationCountrySaga(action) {
  try {
    const isModal = Boolean(action.payload.modal)
    action.payload.locationType = "location_country";
    const result = yield call(fetchLocation, { ...action });
    const { data = {} } = result;
    if (data.success) {
      let returnData = { ...data, isModal }
      yield put(actions.fetchLocationCountrySuccess(returnData));
      if (action.payload.modal) {
        yield put(actions.showModal(true))
      }
    } else {
      yield put(actions.fetchLocationCountryFailure(result));
    }
  } catch (err) {
    yield put(actions.fetchLocationCountryFailure(err));
  }
}

function* fetchLocationStateSaga(action) {
  try {
    const result = yield all((action.payload?.countries || []).map(country => {
      let actionData = {
        ...action,
        payload: {
          ...action.payload,
          locationType: "location_state",
          country: country,
          state:action.payload.state,
        }
      }
      return call(fetchLocation, actionData)
    }))
    const hasError = result.some((res) => !res.data.success);
    const isModal = Boolean(action.payload.modal)
    if (!hasError) {
      let statesArray = [];
      result.map(res => {
        const { data = {} } = res;
        statesArray = [...statesArray, ...data.data ?? []]
      })
      let returnData = { data: [...statesArray], isModal }
      yield put(actions.fetchLocationStateSuccess(returnData ?? []));
      if (action.payload.modal) {
        yield put(actions.showModal(true))
      }
    } else {
      yield put(actions.fetchLocationStateFailure(result));
    }
  } catch (err) {
    yield put(actions.fetchLocationStateFailure(err));
  }
}

export function* currentMembers() {
  yield takeEvery(types.REQUEST_CURRENT_MEMBERS, getCurrentMembers);
}

export function* renewingMembers() {
  yield takeEvery(types.REQUEST_RENEWING_MEMBERS, getRenewingMembers);
}

export function* newMembers() {
  yield takeEvery(types.REQUEST_NEW_MEMBERS, getNewMembers);
}

export function* expiredMembers() {
  yield takeEvery(types.REQUEST_EXPIRED_MEMBERS, getExpiredMembers);
}

export function* extendedHistory() {
  yield takeLatest(types.REQUEST_EXTENDED_HISTORY, getExtendedHistory);
}
export function* memberTransition() {
  yield takeLatest(types.REQUEST_MEMBER_TRANSITION, getMemberTransition);
}
export function* salesActivity() {
  yield takeLatest(types.REQUEST_SALES_ACTIVITY, getSalesActivity);
}
export function* requestMenuChange() {
  yield takeLatest(types.REQUEST_MENU_CHANGE, getMenuChange);
}
export function* fetchMemberDetails() {
  yield takeLatest(types.GET_MEMBER_DETAILS_REQUEST, fetchMemberInfoSaga);
}
export function* fetchLocationCountryDetails() {
  yield takeLatest(types.FETCH_LOCATION_COUNTRY_REQUEST, fetchLocationCountrySaga);
}
export function* fetchLocationStateDetails() {
  yield takeLatest(types.FETCH_LOCATION_STATE_REQUEST, fetchLocationStateSaga);
}

export default function* mySaga() {
  yield all([
    fork(currentMembers),
    fork(renewingMembers),
    fork(newMembers),
    fork(expiredMembers),
    fork(extendedHistory),
    fork(salesActivity),
    fork(requestMenuChange),
    fork(fetchMemberDetails),
    fork(fetchLocationCountryDetails),
    fork(fetchLocationStateDetails),
    fork(memberTransition),
  ]);
}
