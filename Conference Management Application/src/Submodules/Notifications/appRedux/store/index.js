import createSagaMiddleware from "redux-saga";
import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware } from "connected-react-router";
import thunk from "redux-thunk";
import rootSaga from "../sagas/index";
import createRootReducer from "../reducers";

const routeMiddleware = routerMiddleware({});
const sagaMiddleware = createSagaMiddleware();

const middlewares = [thunk, sagaMiddleware, routeMiddleware];

export default function configureStore(preloadedState) {
	let composeEnhancers = compose;
	if (process.env.NODE_ENV === "development") {
		composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
	}
	const store = createStore(
		createRootReducer({}), // root reducer with router state
		preloadedState,
		composeEnhancers(
			applyMiddleware(
				routerMiddleware({}), // for dispatching history actions
				...middlewares
			)
		)
	);

	sagaMiddleware.run(rootSaga);
	return store;
}
