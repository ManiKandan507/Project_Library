import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { requestApi } from "../store/actions/general";

export const useApi = (apiId) => {
  const dispatch = useDispatch();
  const general = useSelector((state) => state.general);

  const status = general[`${apiId}_STATUS`];
  const loading = status === "LOADING" || status === "IDLE";
  const value = general[apiId];

  useEffect(() => {
    dispatch(requestApi(apiId));
  }, []);

  return [loading, value];
};
