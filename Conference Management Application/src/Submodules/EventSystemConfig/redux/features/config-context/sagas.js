// src/features/configContext/configContextSaga.js
import { call, put, takeLatest } from 'redux-saga/effects';
import { updateConfigContext } from './slice';
import * as api from '../../api'; // Import your API functions
import { CONFIG_CONTEXT_REQUEST } from './actionTypes';

// Worker saga: will be fired to request the configContext
function* fetchConfigContext() {
  try {
    const configContext = yield call(api.fetchConfigContext); // Replace with your API call
    console.log(configContext)

    yield put(updateConfigContext(configContext));
  } catch (error) {
    console.error('Failed to fetch configContext:', error);
    // Optionally, handle errors or dispatch a failure action
  }
}

// Saga to be used by the saga middleware
export default function* configContextSagas() {
  yield takeLatest(CONFIG_CONTEXT_REQUEST, fetchConfigContext);
}
