
import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import Wizard from "./Wizard";

const createRootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    wizard: Wizard,
  });

export default createRootReducer;
