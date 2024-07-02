import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import Post from "./Post";
import Exhibitors from "./Exhibitors";
import Session from "./Session";
import Settings from "./Settings";

const createRootReducer = (history) =>
	combineReducers({
		router: connectRouter(history),
		post: Post,
		exhibitors: Exhibitors,
		session: Session,
		settings: Settings,
	});

export default createRootReducer;
