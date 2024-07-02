import createRootReducer from './../reducers/index';
import { createStore } from 'redux';

export const store = createStore(
    createRootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);