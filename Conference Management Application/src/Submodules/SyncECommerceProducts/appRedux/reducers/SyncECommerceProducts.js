/* eslint-disable import/no-anonymous-default-export */
import {
  FETCH_ERROR,
  RECEIVE_ABSTRACT_FIELDS,
  RECEIVE_ABSTRACT_MODULES,
  RECEIVE_FIX_FILE_SIZE,
  RECEIVE_MAIN_PRODUCT_DETAILS,
  RECEIVE_PRODUCT_DESCENDANTS,
  RECEIVE_PRODUCT_DETAILS,
  RECEIVE_SESSION_ABSTRACT_CONFIG,
  RECEIVE_UPDATE_PRODUCTS,
  RECEIVE_WIZARD_CONFIG,
} from "../../constants/ActionTypes";
const INIT_STATE = {
  main_product_details: {},
  main_product_details_fetched: false,
  abstract_modules_fetched: false,
  abstract_fields_fetched: false,
  abstract_modules: [],
  abstract_fields: [],
  session_configs: {},
  abstract_configs: {},
  session_abstract_configs_fetched: false,
  product_descendants: [],
  product_descendants_fetched: false,
  products_updated: false,
  products_update_failed: false,
  wizard_config_fetched: false,
  wizard_config: "{}",
  wizard_config_loading: true,
  children_product_details: {},
  children_product_details_fetched: false,
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case FETCH_ERROR: {
      //TODO: Handle the error
      return { ...state };
    }

    case RECEIVE_MAIN_PRODUCT_DETAILS: {
      return {
        ...state,
        main_product_details: action.payload.data.data[0] ?? {},
        main_product_details_fetched: true,
      };
    }

    case RECEIVE_ABSTRACT_MODULES: {
      return {
        ...state,
        abstract_modules: action.payload.data.data,
        abstract_modules_fetched: true,
      };
    }

    case RECEIVE_ABSTRACT_FIELDS: {
      return {
        ...state,
        abstract_fields: action.payload.data.data,
        abstract_fields_fetched: true,
      };
    }

    case RECEIVE_PRODUCT_DESCENDANTS: {
      return {
        ...state,
        product_descendants: action.payload.data.data,
        product_descendants_fetched: true,
      };
    }
    case RECEIVE_SESSION_ABSTRACT_CONFIG: {
      let session_config = {};
      let abstract_config = {};
      const sessionProductIDs = action.payload.sessionProductIDs;

      const abstractProductIDs = action.payload.abstractProductIDs;

      action.payload.session_configs.forEach((session_conf, index) => {
        if (session_conf?.data?.session_id) {
          if (session_config[sessionProductIDs[index]]) {
            //This must be the bundle's product ID
            session_config[sessionProductIDs[index]] = Array.isArray(
              session_config[sessionProductIDs[index]]
            )
              ? // Multiple session details exists
                [...session_config[sessionProductIDs[index]], session_conf.data]
              : // Only 1 session details added
                [session_config[sessionProductIDs[index]], session_conf.data];
          } else {
            session_config[sessionProductIDs[index]] = session_conf.data;
          }
        }
      });

      action.payload.abstract_configs.forEach((abstract_conf, index) => {
        if (abstract_conf?.data?.abid) {
          abstract_config[abstractProductIDs[index]] = abstract_conf.data;
        }
      });

      return {
        ...state,
        session_abstract_configs_fetched: true,
        session_configs: session_config,
        abstract_configs: abstract_config,
      };
    }

    case RECEIVE_PRODUCT_DETAILS: {
      const productIDs = action.payload.productIDs;
      const productDetails = action.payload.productDetails;
      let prodDetails = {};

      productDetails.forEach((productDetail, index) => {        prodDetails[productIDs[index]] = productDetail.data.data[0];
      });
      return {
        ...state,
        children_product_details: prodDetails,
        children_product_details_fetched: true,
      };
    }

    case RECEIVE_UPDATE_PRODUCTS: {
      return {
        ...state,
        products_updated: action.payload.success == 1 ? true : false,
        products_update_failed: action.payload.success != 1 ? true : false,
      };
    }
    case RECEIVE_WIZARD_CONFIG: {
      return {
        ...state,
        wizard_config:
          action && action.payload && action.payload.data
            ? action.payload.data
            : "{}",
        wizard_config_fetched: action.payload.success == 1 ? true : false,
        wizard_config_loading: action.payload.loading == true ? true : false,
      };
    }

    case RECEIVE_FIX_FILE_SIZE: {
      //Do Nothing
      return { ...state };
    }
    default:
      return state;
  }
};
