import { all } from "redux-saga/effects";

import reportingSagas from "./Reporting";

export default function* rootSaga(getState) {
  yield all([reportingSagas()]);
}
