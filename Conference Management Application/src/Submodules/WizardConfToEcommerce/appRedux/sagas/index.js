import { all } from "redux-saga/effects";

import wizardSagas from "./Wizard";

export default function* rootSaga(getState) {
  yield all([wizardSagas()]);
}
