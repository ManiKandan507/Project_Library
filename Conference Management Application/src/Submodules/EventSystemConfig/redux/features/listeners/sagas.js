import { takeLatest, call, put } from 'redux-saga/effects';
import {
  actionTestingConfigUpdateResponse,
  actionUpdateSuccess,
  conditionsUpdateSuccess,
  eventTypeUpdateSuccess,
  listenersReloadSuccess
} from './slice';
import * as api from '../../api'; // Assuming you have an API module for server communication
import {
  UPDATE_ACTION_REQUEST,
  UPDATE_CONDITIONS_REQUEST,
  UPDATE_EVENT_TYPE_REQUEST,
  RELOAD_LISTENERS_REQUEST,
  UPDATE_ACTION_TESTING_CONFIG_REQUEST // Assuming this is your action type for updating action testing config
} from './actionTypes';



export default function* listenerSaga() {
  yield takeLatest(UPDATE_ACTION_REQUEST, handleActionUpdate);
  yield takeLatest(UPDATE_CONDITIONS_REQUEST, handleConditionsUpdate);
  yield takeLatest(UPDATE_EVENT_TYPE_REQUEST, handleEventTypeUpdate);
  yield takeLatest(RELOAD_LISTENERS_REQUEST, handleListenersReload);
  yield takeLatest(UPDATE_ACTION_TESTING_CONFIG_REQUEST, handleActionTestingConfigUpdate); // Add this line
}



// Saga to handle updating an individual action
function* handleActionUpdate({ payload }) {
  try {
    const { actionKey, actionConfig } = payload;
    const updatedConfig = yield call(api.updateAction, actionConfig, {actionKey, appSlug: window.appSlug});
    yield put(actionUpdateSuccess({ actionKey, newActionConfig: actionConfig }));
  } catch (error) {
    console.error('Action update failed:', error);
    // Optionally dispatch a failure action here
  }
}

// Saga to handle updating conditions
function* handleConditionsUpdate({ payload }) {
  try {
    const { listenerId, newConditions } = payload;
    yield call(api.updateConditions, listenerId, newConditions);
    yield put(conditionsUpdateSuccess({ listenerId, newConditions }));
  } catch (error) {
    console.error('Conditions update failed:', error);
    // Optionally dispatch a failure action here
  }
}

// Saga to handle updating event type
function* handleEventTypeUpdate({ payload }) {
  try {
    const { listenerId, newEventType } = payload;
    yield call(api.updateEventType, listenerId, newEventType);
    yield put(eventTypeUpdateSuccess({ listenerId, newEventType }));
  } catch (error) {
    console.error('Event type update failed:', error);
    // Optionally dispatch a failure action here
  }
}

// Saga to handle reloading listeners
function* handleListenersReload() {
  try {
    const listeners = yield call(api.reloadListeners);
    console.log("AllListeners", listeners)
    yield put(listenersReloadSuccess(listeners));
  } catch (error) {
    console.error('Listeners reload failed:', error);
    // Optionally dispatch a failure action here
  }
}

// Saga to handle updating action testing configuration
function* handleActionTestingConfigUpdate({ payload }) {
  try {
    const { testModeEnabled, testModeAdminEmail, actionKey } = payload;
    const response = yield call(api.updateActionTestingConfig, { testModeEnabled, testModeAdminEmail, actionKey });
    yield put(actionTestingConfigUpdateResponse({success:true, testModeEnabled, testModeAdminEmail, actionKey })); // Dispatch success action with the response
  } catch (error) {
    console.error('Action testing config update failed:', error);
    yield put(actionTestingConfigUpdateResponse({success: false}))
    // Optionally dispatch a failure action here
  }
}