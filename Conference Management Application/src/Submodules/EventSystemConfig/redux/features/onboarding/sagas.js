import { call, put, takeLatest } from 'redux-saga/effects';
import {
  SAVE_LISTENER_START,
  SAVE_LISTENER_SUCCESS,
  SAVE_LISTENER_FAILURE
} from './actionTypes'; // Adjust the import path based on your project structure
import { submitListener } from '../../api';
import { saveListenerFailure, saveListenerSuccess } from './slice';
import { resetListeners } from '../listeners/slice';

function* saveListenerSaga(action) {
  try {
    yield call(submitListener, action.payload)
    yield put(saveListenerSuccess());
    // Dispatch updateListener action from another slice if needed
    setTimeout(() => {
      resetListeners()
    }, 600)
  } catch (error) {
    yield put(saveListenerFailure());
  }
}

function* listenerSaga() {
  yield takeLatest(SAVE_LISTENER_START, saveListenerSaga);
}

export default listenerSaga;
