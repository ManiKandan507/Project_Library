import { all } from "redux-saga/effects";

import CSVProcessorSaga from "./SyncECommerceProducts";

export default function* rootSaga(getState) {
  yield all([CSVProcessorSaga()]);
}
