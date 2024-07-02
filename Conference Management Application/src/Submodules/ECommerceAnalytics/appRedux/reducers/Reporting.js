/* eslint-disable import/no-anonymous-default-export */
import * as types from "../../constants/ActionTypes";
import _findKey from 'lodash/findKey';
import { sampleUserDetails, userDeatils } from "../../components/Ecommerce/Utils";

const INIT_STATE = {
  activeReport: "home",
  showModal: false,
  processAllMembersExport: false,
  sendEmail: false,
  loading: false,
  insightDataLoading: false,
  productLoading: false,
  viewedFileLoading: false,
  activeUserLoading: false,
  monthlyActiveUserLoading: false,
  monthlyBandwidthLoading: false,
  fileChartLoading: false,
  productViewChartLoading: false,
  mostViewProductData: {
    offset: 0,
    products: [],
  },
  activeUsersData: [],
  activeUsersUidData: {},
  isActiveUserSuccess: false,
  mostViewFileData: [],
  monthlyActiveUserData: [],
  monthlyBandwidthData: [],
  monthlyFilesViewData: [],
  insightData: {},
  fileStatisticData: {},
  productViewData: {},
  activeCustomerData: {
    users: []
  },
  userCustomerLoading: false,
  isUserDetailsSuccess: false,
  userContactDetails: [],
  fetchUserUuidFailed: false,
  fetchUserDataFailed: false,
  fetchProductDataFailed: false,
};
export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case types.RECEIVE_MENU_CHANGE: {
      return {
        ...state,
        activeReport: action.payload.payload.screen,
      };
    }

    case types.SHOW_MODAL: {
      return { ...state, showModal: action.payload }
    }

    case types.HANDLE_ALL_MEMBERS_EXPORT: {
      return { ...state, processAllMembersExport: action.payload };
    }

    case types.SEND_EMAIL_REQUEST: {
      return { ...state, sendEmail: action.payload };
    }

    case types.FETCH_MOST_VIEWED_PRODUCTS_REQUEST: {
      return { ...state, productLoading: true, mostViewProductData: { products: [] } }
    }

    case types.FETCH_MOST_VIEWED_PRODUCTS_SUCCESS: {
      // let tempProducts = action.payload.products;
      // if (action.payload.offset > 0) {
      //   tempProducts = [ ...state.mostViewProductData.products, ...action.payload.products ]
      // }
      return {
        ...state,
        productLoading: false,
        mostViewProductData: {
          ...action.payload,
          // products: tempProducts,
        }
      }
    }
    case types.FETCH_MOST_VIEWED_PRODUCTS_FAILURE: {
      return { ...state, productLoading: false }
    }
    case types.FETCH_ACTIVE_USERS_UID_REQUEST: {
      return { ...state, activeUserLoading: true, activeUsersData: [] }
    }
    case types.FETCH_ACTIVE_USERS_UID_SUCCESS: {
      return { ...state, activeUsersUidData: action.payload, isActiveUserSuccess: true }
    }
    case types.FETCH_ACTIVE_USERS_UID_FAILURE: {
      return { ...state, isActiveUserSuccess: false }
    }
    case types.FETCH_ACTIVE_USERS_DATA_REQUEST: {
      return { ...state, activeUserLoading: true }
    }
    case types.FETCH_ACTIVE_USERS_DATA_SUCCESS: {
      return {
        ...state,
        activeUserLoading: false,
        activeUsersData: action.payload,
        isActiveUserSuccess: false
      }
    }
    case types.FETCH_ACTIVE_USERS_DATA_FAILURE: {
      return { ...state, activeUserLoading: false }
    }
    case types.FETCH_MOST_VIEWED_FILES_REQUEST: {
      return { ...state, viewedFileLoading: true, mostViewFileData: [] }
    }
    case types.FETCH_MOST_VIEWED_FILES_SUCCESS: {
      return { ...state, viewedFileLoading: false, mostViewFileData: action.payload }
    }
    case types.FETCH_MOST_VIEWED_FILES_FAILURE: {
      return { ...state, viewedFileLoading: false }
    }
    case types.FETCH_INSIGHTS_DATA_REQUEST: {
      return { ...state, insightDataLoading: true }
    }
    case types.FETCH_INSIGHTS_DATA_SUCCESS: {
      return { ...state, insightDataLoading: false, insightData: action.payload }
    }
    case types.FETCH_MOST_VIEWED_FILES_FAILURE: {
      return { ...state, insightDataLoading: false }
    }
    case types.FETCH_MONTHLY_ACTIVE_USERS_REQUEST: {
      return { ...state, monthlyActiveUserLoading: true }
    }
    case types.FETCH_MONTHLY_ACTIVE_USERS_SUCCESS: {
      return {
        ...state,
        monthlyActiveUserLoading: false,
        monthlyActiveUserData: action.payload
      }
    }
    case types.FETCH_MONTHLY_ACTIVE_USERS_FAILURE: {
      return { ...state, monthlyActiveUserLoading: false }
    }
    case types.FETCH_MONTHLY_BANDWIDTH_DATA_REQUEST: {
      return { ...state, monthlyBandwidthLoading: true }
    }
    case types.FETCH_MONTHLY_BANDWIDTH_DATA_SUCCESS: {
      return {
        ...state,
        monthlyBandwidthLoading: false,
        monthlyBandwidthData: action.payload
      }
    }
    case types.FETCH_MONTHLY_BANDWIDTH_DATA_FAILURE: {
      return { ...state, monthlyBandwidthLoading: false }
    }
    case types.FETCH_FILES_STATISTICS_DATA_REQUEST: {
      return { ...state, loading: true }
    }
    case types.FETCH_FILES_STATISTICS_DATA_SUCCESS: {
      return {
        ...state,
        loading: false,
        fileStatisticData: action.payload
      }
    }
    case types.FETCH_FILES_STATISTICS_DATA_FAILURE: {
      return { ...state, loading: true }
    }
    case types.FETCH_MONTHLY_FILE_VIEWS_REQUEST: {
      return { ...state, fileChartLoading: true }
    }
    case types.FETCH_MONTHLY_FILE_VIEWS_SUCCESS: {
      return {
        ...state,
        fileChartLoading: false,
        monthlyFilesViewData: action.payload
      }
    }
    case types.FETCH_MONTHLY_FILE_VIEWS_FAILURE: {
      return { ...state, fileChartLoading: false }
    }
    case types.FETCH_PRODUCT_VIEWS_BY_USER_REQUEST: {
      return { ...state, productViewChartLoading: true }
    }
    case types.FETCH_PRODUCT_VIEWS_BY_USER_SUCCESS: {
      return {
        ...state,
        productViewChartLoading: false,
        productViewData: action.payload,
        fetchProductDataFailed: false
      }
    }
    case types.FETCH_PRODUCT_VIEWS_BY_USER_FAILURE: {
      return { ...state, productViewChartLoading: false, fetchProductDataFailed: true }
    }
    case types.FETCH_USER_CUSTOMER_ID_REQUEST: {
      return { 
        ...state, 
        userCustomerLoading: true, 
        productViewData: {} , 
        fetchUserUuidFailed: false,
        userContactDetails: []
      }
    }
    case types.FETCH_USER_CUSTOMER_ID_SUCCESS: {
      return {
        ...state,
        activeCustomerData: action.payload,
        isUserDetailsSuccess: true,
      }
    }
    case types.FETCH_USER_CUSTOMER_ID_FAILURE: {
      return { 
        ...state, 
        userCustomerLoading: false, 
        fetchUserUuidFailed: true 
      }
    }
    case types.FETCH_USER_CONTACT_DETAILS_REQUEST: {
      return { 
        ...state, 
        fetchUserDataFailed: false,
      }
    }
    case types.FETCH_USER_CONTACT_DETAILS_SUCCESS: {
      return {
        ...state,
        userContactDetails: action.payload,
        userCustomerLoading: false,
        isUserDetailsSuccess: false,
      }
    }
    case types.FETCH_USER_CONTACT_DETAILS_FAILURE: {
      return { 
        ...state, 
        fetchUserDataFailed: true 
      }
    }
    default:
      return state;
  }
};
