import { all } from 'redux-saga/effects';
import listenerSaga from './listeners/sagas';
import configContextSagas from './config-context/sagas';
import onboardListenerSaga from './onboarding/sagas';

export default function* rootSaga() {
  yield all([
    listenerSaga(),
    configContextSagas(),
    onboardListenerSaga()
  ]);
}