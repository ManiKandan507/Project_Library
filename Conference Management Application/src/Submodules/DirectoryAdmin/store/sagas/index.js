import { all, fork } from "redux-saga/effects";

import generalSaga from "./general";
import directorySaga from "./directory";

export default function* () {
  yield all([fork(generalSaga), fork(directorySaga)]);
}
