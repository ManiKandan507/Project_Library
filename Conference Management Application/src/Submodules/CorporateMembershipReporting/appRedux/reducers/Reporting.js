/* eslint-disable import/no-anonymous-default-export */
import * as types from "../../constants/ActionTypes";
import _findKey from 'lodash/findKey';
import moment from "moment";
import { CURRENT_MEMBERS_SCREEN, LOCATION_INITIAL_STATE, LOCATION_MODAL } from "../../constants";
import { hashMapCountryBasedData, hashMapStateBasedData } from "../../components/Reporting/LocationReport/helper";

const INIT_STATE = {
  currentMembers: "",
  trend: "",
  activeReport: CURRENT_MEMBERS_SCREEN,
  sales: "",
  renewingMembers: "",
  newMembers: "",
  expiredMembers: "",
  membersInfo: [],
  allMemberInfo: [],
  showModal: false,
  processAllMembersExport: false,
  sendEmail: false,
  locationsInfo: LOCATION_INITIAL_STATE,
};
export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case types.RECEIVE_CURRENT_MEMBERS: {
      return {
        ...state,
        currentMembers: action.payload,
      };
    }
    case types.RECEIVE_RENEWING_MEMBERS: {
      return {
        ...state,
        renewingMembers: action.payload,
      };
    }
    case types.RECEIVE_NEW_MEMBERS: {
      return {
        ...state,
        newMembers: action.payload,
      };
    }
    case types.RECEIVE_EXPIRED_MEMBERS: {
      return {
        ...state,
        expiredMembers: action.payload,
      };
    }
    case types.RECEIVE_EXTENDED_HISTORY: {
      return {
        ...state,
        trend:
          action.payload.data.success === 1 ? action.payload.data.data : [],
      };
    }
    case types.RECEIVE_SALES_ACTIVITY: {
      return {
        ...state,
        sales:
          action.payload.data.success === 1 ? action.payload.data.data : [],
      };
    }
    case types.RECEIVE_MENU_CHANGE: {
      return {
        ...state,
        activeReport: action.payload.payload.screen,
      };
    }

    case types.GET_MEMBER_DETAILS_REQUEST: {
      return { ...state, loading: true }
    }
    case types.GET_MEMBER_DETAILS_SUCCESS: {
      return { ...state, loading: false, membersInfo: action.payload }
    }
    case types.GET_MEMBER_DETAILS_FAILURE: {
      return { ...state, loading: false }
    }

    case types.FETCH_LOCATION_COUNTRY_REQUEST: {
      return { ...state, loading: true }
    }
    case types.FETCH_LOCATION_COUNTRY_SUCCESS: {
      const { data = [], isModal = false } = action.payload;
      let result = { ...state.locationsInfo };
      if (isModal) {
        result[LOCATION_MODAL] = [...data]
      } else {
        result = { ...result, ...hashMapCountryBasedData(data) };
      }
      return { ...state, loading: false, locationsInfo: result }
    }
    case types.FETCH_LOCATION_COUNTRY_FAILURE: {
      return { ...state, loading: false }
    }

    case types.FETCH_LOCATION_STATE_REQUEST: {
      return { ...state, loading: true }
    }
    case types.FETCH_LOCATION_STATE_SUCCESS: {
      const { data = [], isModal = false } = action.payload;
      let result = { ...state.locationsInfo };
      if (isModal) {
        result[LOCATION_MODAL] = [...data]
      } else {
        result = { ...result, ...hashMapStateBasedData(data) };
      }
      return { ...state, loading: false, locationsInfo: result }
    }
    case types.FETCH_LOCATION_STATE_FAILURE: {
      return { ...state, loading: false }
    }

    case types.SHOW_MODAL: {
      return { ...state, showModal: action.payload }
    }

    case types.UPDATE_ALL_MEMBER_DETAILS: {
      let allMemberInfo = action.payload.data.map(data => ({
        Firstname: data.Firstname ?? "",
        Lastname: data.Lastname ?? "",
        Company: data.Company ?? "",
        MemberJoinDate: moment(data.MemberJoinDate).isValid() ? moment(data.MemberJoinDate).format("MM/DD/YYYY") : '',
        Email: data.Email ?? "",
        ReviewIDThisCustID: data.ReviewIDThisCustID ?? "",
        CompID: data.CompID ?? "",
      }));
      return { ...state, allMemberInfo, loading: false };
    }

    case types.HANDLE_ALL_MEMBERS_EXPORT: {
      return { ...state, processAllMembersExport: action.payload };
    }

    case types.SEND_EMAIL_REQUEST: {
      return { ...state, sendEmail: action.payload };
    }
    default:
      return state;
  }
};
