import { GET_SETTINGS } from "../../constants/ActionTypes";

export const fetchSettings = (payload) => {
	return {
		type: GET_SETTINGS,
		payload,
	};
};
