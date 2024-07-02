import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import SyncECommerceProducts from "./SyncECommerceProducts";

const createRootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    sync_products: SyncECommerceProducts,
  });

export default createRootReducer;
