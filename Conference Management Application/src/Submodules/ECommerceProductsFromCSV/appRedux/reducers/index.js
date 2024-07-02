import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import CSVProcessor from "./CSVProcessor";

const createRootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    csv_processor: CSVProcessor,
  });

export default createRootReducer;
