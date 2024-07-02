import Test from "./Test";
import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import Reporting from "./Reporting";

const createRootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    reporting: Reporting,
  });

export default createRootReducer;
