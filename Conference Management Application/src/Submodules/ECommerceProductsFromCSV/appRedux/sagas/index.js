import { all } from "redux-saga/effects";

import CSVProcessorSaga from "./CSVProcessor";

export default function* rootSaga(getState) {
  yield all([CSVProcessorSaga()]);
}
