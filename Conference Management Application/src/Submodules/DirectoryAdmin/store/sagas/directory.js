import { call, put, takeLatest, select } from "redux-saga/effects";
import axios from "axios";

import {
  loadingUpdateDirectory,
  receiveUpdateDirectory,
  loadingAddDirectory,
  receiveAddDirectory,
  loadingRemoveDirectory,
  receiveRemoveDirectory,
} from "../actions/directory";

import { toBackendDirectory } from "../../helpers";
import { domainUrl } from "../api";

function* updateDirectorySaga({ payload }) {
  const status = yield select(state => state.directory.UPDATE_DIRECTORY_STATUS);
  if (status === "LOADING") return;
  yield put(loadingUpdateDirectory());

  const appDir = yield select(state => state.directory.APP_DIR);

  const directory = toBackendDirectory(payload);

  const { data } = yield call(
    axios.put,
    `${domainUrl}?appdir=${appDir}&module=directory&component=member_directory&function=update_directory`,
    directory
  );

  yield put(receiveUpdateDirectory(data));
}

function* addDirectorySaga({ payload }) {
  const status = yield select(state => state.directory.ADD_DIRECTORY_STATUS);
  if (status === "LOADING") return;
  yield put(loadingAddDirectory());

  const appDir = yield select(state => state.directory.APP_DIR);

  const directory = {
    DirectoryName: payload.name,
    directory_type: payload.type === "company" ? "compid" : "",
    // ConfigJSON: JSON.stringify({ is_mini_directory: payload.isMini }),
  };

  const { data } = yield call(
    axios.post,
    `${domainUrl}?appdir=${appDir}&module=directory&component=member_directory&function=add_directory`,
    directory
  );

  yield put(receiveAddDirectory(data));
}

function* removeDirectorySaga({ payload }) {
  const status = yield select(state => state.directory.REMOVE_DIRECTORY_STATUS);
  if (status === "LOADING") return;
  yield put(loadingRemoveDirectory());

  const appDir = yield select(state => state.directory.APP_DIR);

  const directory = { DirectoryID: payload.id };

  const { data } = yield call(
    axios.delete,
    `${domainUrl}?appdir=${appDir}&module=directory&component=member_directory&function=remove_directory`,
    { data: directory }
  );

  yield put(receiveRemoveDirectory(data));
}

export default function* () {
  yield takeLatest("REQUEST-UPDATE-DIRECTORY", updateDirectorySaga);
  yield takeLatest("REQUEST-ADD-DIRECTORY", addDirectorySaga);
  yield takeLatest("REQUEST-REMOVE-DIRECTORY", removeDirectorySaga);
}
