import { FETCH_ERROR } from "../../constants/ActionTypes";

export const fetchError = (error) => {
	return {
		type: FETCH_ERROR,
		payload: error,
	};
};
