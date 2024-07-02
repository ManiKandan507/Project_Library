import { call, fork, put, takeEvery, select } from "redux-saga/effects";
import axios from "axios";
import { createMatchSelector } from "connected-react-router";

import apis from "../api";
import { loadingApi, receiveApi } from "../actions/general";

function* generalSaga({ type }) {
  const [, apiId] = type.split("-");

  const status = yield select(state => state.general[`${apiId}_STATUS`]);
  if (status !== "IDLE") return;

  yield put(loadingApi(apiId));
  const api = apis.find(api => api.id === apiId);

  const appDir = yield select(state => state.directory.APP_DIR);
  try {
    const { data } = yield call(axios.get, api.endpoint(appDir));
    yield put(receiveApi(apiId, data));
  } catch (err) {
    console.log('error', err);
  }
}

export default function* () {
  for (const api of apis) {
    yield takeEvery(`REQUEST-${api.id}`, generalSaga);
  }
}
