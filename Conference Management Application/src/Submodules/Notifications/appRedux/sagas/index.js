import { all } from "redux-saga/effects";
import exhibitorsSaga from "./Exhibitors";
import sessionSagas from "./Session";

export default function* rootSaga(getState) {
	yield all([
		exhibitorsSaga(),
		sessionSagas(),
	]);
}
