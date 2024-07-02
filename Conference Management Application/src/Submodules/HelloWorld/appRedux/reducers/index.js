import Test from "./TestState";
import { combineReducers } from 'redux'

const createRootReducer = combineReducers({
    test: Test
});

export default createRootReducer
