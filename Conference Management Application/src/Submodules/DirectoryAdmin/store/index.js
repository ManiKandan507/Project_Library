import createSagaMiddleware from "redux-saga";
import { applyMiddleware, combineReducers, createStore, compose } from "redux";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createHashHistory } from "history";

import rootSaga from "./sagas";
import generalReducer from "./reducers/general";
import directoryReducer from "./reducers/directory";

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const history = createHashHistory();

const rootReducer = combineReducers({
  router: connectRouter(history),
  general: generalReducer,
  directory: directoryReducer,
});

export default function configureStore() {
  const store = createStore(
    rootReducer,
    {},
    composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware))
  );
  sagaMiddleware.run(rootSaga);
  return store;
}
