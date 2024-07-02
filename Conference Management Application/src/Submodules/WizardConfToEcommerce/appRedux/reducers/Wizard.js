/* eslint-disable import/no-anonymous-default-export */
import {
  RECEIVE_NEXT_STEP,
  RECEIVE_PREVIOUS_STEP,
  RECEIVE_SET_STEP,
  RECEIVE_ALL_CONFERENCES,
  RECEIVE_ALL_STORES,
  RECEIVE_STORE_SELECTED_CONFERENCE,
  RECEIVE_SESSION_TYPES,
  RECEIVE_ALL_SESSIONS,
  RECEIVE_STORE_SELECTED_SESSION_TYPES,
  RECEIVE_CONTACT_GROUPS,
  RECEIVE_STORE_CONFERENCE_PRICING,
  RECEIVE_STORE_SESSION_PRICING,
  RECEIVE_ABSTRACT_MODULES,
  RECEIVE_ABSTRACT_FIELDS,
  RECEIVE_STORE_ABSTRACT_FIELDS,
  RECEIVE_ABSTRACTS,
  RECEIVE_SESSION_ABSTRACT_CONFIG,
  RECEIVE_UPDATE_CONFERENCE_DETAILS,
  RECEIVE_ATTENDEE_GROUPS,
  RECEIVE_CONF_MENUS,
  RECEIVE_LOADING_CONF_MENUS,
  RECEIVE_FETCH_ADD_PROD_CATEGORY,
  RECEIVE_ADD_PRODUCTS,
  FETCH_ERROR,
  MIGRATION_FETCH_ERROR,
  RECEIVE_ADD_PRODUCT_PRICING_AND_ACCESS,
  RECEIVE_ADD_RELATION,
  RECEIVE_PERFORM_ROLLBACK,
  RECEIVE_UPLOAD_TO_S3,
  RECEIVE_ALL_SESSIONS_DETAILS,
  RECEIVE_CLEAR_EXECUTE_MIGRATION_STATE,
  RECEIVE_START_MIGRATION,
  RECEIVE_STOP_MIGRATION,
  RECEIVE_CREDIT_DETAILS,
  RECEIVE_FORM_DETAILS,
  RECEIVE_STORE_CREDITS,
  RECEIVE_STORE_EVALUATION_SESSIONS,
  RECEIVE_STORE_CUSTOM_BUNDLES,
  RECEIVE_UPDATE_CUSTOM_BUNDLE_ABSTRACTS,
  RECEIVE_FIX_FILE_SIZE,
  RECEIVE_CLONE_FORM,
  RECEIVE_STORE_WIZARD_CONFIG,
} from "../../constants/ActionTypes";
const initExecutionState = {
  global_status: {
    processed_conference_products: [],
    processed_session_products: [],
    session_configs_fetched: false,
    abstract_configs_fetched: false,
    product_category_fetched: false,
    performRollback: false,
    abstract_products_created: false,
    rollbackCompleted: false,
    rollbackFailed: false,
    cloneFormCompleted: false,
  },
  conference_product: {},
  session_products: {}, //session_id map with status
  abstract_products: {},
  session_configs: {}, //mongo.cfm response map for session
  abstract_configs: {}, //mongo.cfm response map for abstract
  product_category_id: "",
};

const INIT_STATE = {
  start_migration: false,
  current_step: 0,
  config: {
    conference: {},
    store: {},
    menu: {},
    session_list: [],
    conference_pricing: [],
    session_pricing: [],
    abstract_fields: [],
    custom_bundles: [],
    sell_session: null,
    abstract_tag: null,
    credits: [],
    evaluations: [],
    sell_abstract: "false",
    create_custom_bundle: "false",
    include_evaluation_credit: "false",
    abstracts: {}, //all abstract for sessionID(KEY)
  },
  select_conference: {
    conferences: [],
    stores: [],
    menus: [],
    conferences_fetched: false,
    stores_fetched: false,
    menus_fetched: false,
  },
  select_session_types: {
    session_types: {},
    all_sessions: [],
    all_sessions_details: [],
    session_types_fetched: false,
    all_sessions_fetched: false,
    all_sessions_details_fetched: false,
  },
  conference_pricing: {
    contact_groups: [],
    contact_groups_fetched: false,
    attendee_groups: [],
    attendee_groups_fetched: false,
    image_url: "",
  },
  session_pricing: {},
  abstract_fields: {
    abstract_modules: [],
    abstract_fields: [],
    abstract_modules_fetched: false,
    abstract_fields_fetched: false,
  },
  evaluation_credits: {
    credit_details: [],
    form_details: [],
    credit_details_fetched: false,
    form_details_fetched: false,
    visited: false,
  },
  execute_migration: initExecutionState,
};
/**
 * Sample Config:
  config: {
      "source_hex": "8A352BA8-9982-42FF-AE5A-31D48B827D37",
      "conference_id": {<<FULL CONFERENCE OBJECT>>},
      "store_id":{<<FULL STORES OBJECT>>},
      "session_id_list": [],
      "conference_pricing": [
        {pricing_id:1, "scope": "public", "price": 0 },
        {pricing_id:2, "scope": "attendee", attendees:[{REG_DETAILS1},{REG_DETAILS2}],"price": 0 },
        {pricing_id:2, "scope": "attendee", attendees:[{REG_DETAILS1},{REG_DETAILS2}],"price": 30 },
        {pricing_id:3, "scope": "group", "groups": [{GROUP DETAILS}, {GROUP DETAILS}], "price": 20 }
      ],
      session_pricing :[
        {pricing_id:1, "scope": "public", "session_price": 0 , abstract_price: 0},
        {pricing_id:2, "scope": "attendee", attendees:[{REG_DETAILS1},{REG_DETAILS2}], sessions:[{SESSION DETAILS},{SESSION DETAILS}] ,"session_price": 0 , abstract_price: 0 },
        {pricing_id:3, "scope": "attendee", attendees:[{REG_DETAILS1},{REG_DETAILS2}], sessions:[{SESSION DETAILS},{SESSION DETAILS}] ,"session_price": 0 , abstract_price: 0 },
        {pricing_id:4, "scope": "group", "groups": [{GROUP DETAILS}, {GROUP DETAILS}], sessions:[{SESSION DETAILS},{SESSION DETAILS}],"session_price": 0 , abstract_price: 0 }
      ]
      "abstract_fields": [
        { "fieldid": 1234, "displayLabel": true},
        { "fieldid": 456, "displayLabel": true},
      ]
    }
    execute_migration: {
      global_status:{
        processed_conference_products:[<<CONFERENCE ID>>], // This will be used for showing progress
        processed_session_products:[<<SESSION ID1>>, <<SESSION ID2>>, <<SESSION ID3>>] // This will be used for showing progress
      }
      conference_product:{
        product_created: true,
        product_id:100,
        product_pricing_created: true,
      },
      session_products:{
        <<SESSION ID1>>:{
          product_id: 200,
          product_created:true,
          parent_relation_created: true,
          product_pricing_created : true
          abstract:{
            <<ABSTRACT ID1>>:
            {
              product_id: 201,
              product_created:true,
              parent_relation_created: true,
              product_pricing_created : true
            },
            <<ABSTRACT ID2>>:{
              product_id: 202,
              product_created:true,
              parent_relation_created: true,
              product_pricing_created : true
            },
        }
        <<SESSION ID2>>:{
          product_id: 300,
          product_created:true,
          parent_relation_created: true,
          product_pricing_created : true
          abstract:{  
            <<ABSTRACT ID1>>:
            {
              product_id:301,
              product_created:true,
              parent_relation_created: true,
              product_pricing_created : true
            },
            <<ABSTRACT ID2>>:{
              product_id: 302,
              product_created:true,
              parent_relation_created: true,
              product_pricing_created : true
            },
        }
    },
  },
 */

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case FETCH_ERROR: {
      //TODO: Handle the error
      return { ...state };
    }

    case RECEIVE_NEXT_STEP: {
      return {
        ...state,
        current_step: state.current_step + 1,
      };
    }

    case RECEIVE_PREVIOUS_STEP: {
      return {
        ...state,
        current_step: state.current_step - 1 < 0 ? 0 : state.current_step - 1,
      };
    }

    case RECEIVE_SET_STEP: {
      return {
        ...state,
        current_step: action.payload,
      };
    }

    case RECEIVE_ALL_CONFERENCES: {
      return {
        ...state,
        select_conference: {
          ...state.select_conference,
          conferences: action.payload.data.data,
          conferences_fetched: true,
        },
      };
    }

    case RECEIVE_ALL_STORES: {
      return {
        ...state,
        select_conference: {
          ...state.select_conference,
          stores: action.payload.data.data,
          stores_fetched: true,
        },
      };
    }

    case RECEIVE_STORE_SELECTED_CONFERENCE: {
      return {
        ...state,
        config: {
          ...state.config,
          conference: action.payload.conference,
          store: action.payload.store,
          sell_session: action.payload.sell_session,
          abstract_tag: action.payload.abstract_tag,
          include_evaluation_credit: action.payload.include_evaluation_credit,
          menu: action.payload.menu,
          create_custom_bundle: action.payload.create_custom_bundle,
          session_list: [],
          abstracts: {},
          sell_abstract: action.payload.sell_abstract,
          conference_pricing: [],
          session_pricing: [],
          custom_bundles: [],
        },
        select_session_types: {
          ...state.select_session_types,
          session_types_fetched: false,
          all_sessions_fetched: false,
        },
        abstract_fields: {
          ...state.abstract_fields,
          abstract_fields_fetched: false,
          abstract_modules_fetched: false,
        },
        evaluation_credits: {
          ...state.evaluation_credits,
          credit_details_fetched: false,
          form_details_fetched: false,
          visited: false,
        },
        conference_pricing: {
          ...state.conference_pricing,
          contact_groups: [],
          contact_groups_fetched: false,
          attendee_groups: [],
          attendee_groups_fetched: false,
        },
        session_pricing: {},
      };
    }

    case RECEIVE_SESSION_TYPES: {
      return {
        ...state,
        select_session_types: {
          ...state.select_session_types,
          session_types: action.payload.data,
          session_types_fetched: true,
        },
      };
    }

    case RECEIVE_ALL_SESSIONS: {
      return {
        ...state,
        select_session_types: {
          ...state.select_session_types,
          all_sessions: action.payload.data,
          all_sessions_fetched: true,
        },
      };
    }
    case RECEIVE_ALL_SESSIONS_DETAILS: {
      if (action.payload?.success == 0) {
        return state;
      } else {
        return {
          ...state,
          select_session_types: {
            ...state.select_session_types,
            all_sessions_details: action.payload.data,
            all_sessions_details_fetched: true,
          },
        };
      }
    }

    case RECEIVE_STORE_SELECTED_SESSION_TYPES: {
      return {
        ...state,
        config: {
          ...state.config,
          session_list: action.payload,
        },
        evaluation_credits: {
          ...state.evaluation_credits,
          credit_details_fetched: false,
          form_details_fetched: false,
        },
      };
    }

    case RECEIVE_CONTACT_GROUPS: {
      return {
        ...state,
        conference_pricing: {
          ...state.conference_pricing,
          contact_groups: action.payload.data.data,
          contact_groups_fetched: true,
        },
      };
    }

    case RECEIVE_ATTENDEE_GROUPS: {
      return {
        ...state,
        conference_pricing: {
          ...state.conference_pricing,
          attendee_groups: action.payload.data.data,
          attendee_groups_fetched: true,
        },
      };
    }

    case RECEIVE_STORE_CONFERENCE_PRICING: {
      return {
        ...state,
        config: {
          ...state.config,
          conference_pricing: action.payload,
        },
      };
    }

    case RECEIVE_STORE_SESSION_PRICING: {
      return {
        ...state,
        config: {
          ...state.config,
          session_pricing: action.payload,
        },
      };
    }

    case RECEIVE_ABSTRACT_MODULES: {
      return {
        ...state,
        abstract_fields: {
          ...state.abstract_fields,
          abstract_modules: action.payload.data.data,
          abstract_modules_fetched: true,
        },
      };
    }

    case RECEIVE_ABSTRACT_FIELDS: {
      return {
        ...state,
        abstract_fields: {
          ...state.abstract_fields,
          abstract_fields: action.payload.data.data,
          abstract_fields_fetched: true,
        },
      };
    }

    case RECEIVE_STORE_ABSTRACT_FIELDS: {
      return {
        ...state,
        config: {
          ...state.config,
          abstract_fields: action.payload,
        },
      };
    }

    case RECEIVE_STORE_CUSTOM_BUNDLES: {
      return {
        ...state,
        config: {
          ...state.config,
          custom_bundles: action.payload,
          // the change in custom bundle changes the session to show on session Pricing page so making the session pricing as empty
          session_pricing: [],
        },
      };
    }

    case RECEIVE_UPDATE_CUSTOM_BUNDLE_ABSTRACTS: {
      return {
        ...state,
        config: {
          ...state.config,
          abstracts: {
            ...state.config.abstracts,
            ...action.payload,
          },
        },
      };
    }

    case RECEIVE_ABSTRACTS: {
      let abstracts = {};
      action.payload.forEach(result => {
        abstracts[result.sessionID] = result.data.data;
      });
      return {
        ...state,
        config: {
          ...state.config,
          abstracts: {
            ...state.config.abstracts,
            ...abstracts,
          },
        },
      };
    }

    case RECEIVE_SESSION_ABSTRACT_CONFIG: {
      let session_config = {};
      let abstract_config = {};

      action.payload.session_configs.forEach(session_conf => {
        if (session_conf?.data?.session_id) {
          session_config[session_conf.data.session_id] = session_conf.data;
        }
      });

      action.payload.abstract_configs.forEach(abstract_conf => {
        if (abstract_conf?.data?.abid) {
          abstract_config[abstract_conf.data.abid] = abstract_conf.data;
        }
      });

      return {
        ...state,
        execute_migration: {
          ...state.execute_migration,
          global_status: {
            ...state.execute_migration.global_status,
            session_configs_fetched: true,
            abstract_configs_fetched: true,
          },
          session_configs: session_config,
          abstract_configs: abstract_config,
        },
      };
    }

    case RECEIVE_UPDATE_CONFERENCE_DETAILS: {
      return {
        ...state,
        config: {
          ...state.config,
          conference: {
            ...state.config.conference,
            Conf_description: action.payload.description,
            image_url: action.payload.image_url,
          },
        },
      };
    }

    case MIGRATION_FETCH_ERROR: {
      return {
        ...state,
        execute_migration: {
          ...state.execute_migration,
          global_status: {
            ...state.execute_migration.global_status,
            performRollback: true,
          },
        },
      };
    }

    case RECEIVE_ADD_PRODUCTS: {
      if (action.payload.type === "conference") {
        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            global_status: {
              ...state.execute_migration.global_status,
              processed_conference_products: [
                ...state.execute_migration.global_status
                  .processed_conference_products,
                action.payload.type_ids[0],
              ],
            },
            conference_product: {
              ...state.execute_migration.conference_product,
              product_created: true,
              product_id: action.payload.ProductIDs[0], //As it will always be 1 conference product
              product_pricing_created: false,
            },
          },
        };
      } else if (action.payload.type === "session") {
        let session_products = {};
        action.payload.type_ids.forEach((sessionid, index) => {
          session_products[sessionid] = {
            product_id: action.payload.ProductIDs[index],
            product_created: true,
            parent_relation_created: false,
            product_pricing_created: false,
          };
        });

        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            global_status: {
              ...state.execute_migration.global_status,
              processed_session_products: [
                ...state.execute_migration.global_status
                  .processed_session_products,
                action.payload.type_ids,
              ],
            },
            session_products: {
              ...state.execute_migration.session_products,
              ...session_products,
            },
          },
        };
      } else if (action.payload.type === "abstract") {
        let abstract_products = {};
        action.payload.type_ids.forEach((abstractid, index) => {
          abstract_products[abstractid] = {
            product_id: action.payload.ProductIDs[index],
            product_created: true,
            parent_relation_created: false,
            product_pricing_created: false,
          };
        });

        return {
          ...state,

          execute_migration: {
            ...state.execute_migration,
            global_status: {
              ...state.execute_migration.global_status,
              abstract_products_created: true,
            },
            abstract_products: {
              ...state.execute_migration.abstract_products,
              ...abstract_products,
            },
          },
        };
      } else {
        return { ...state };
      }
    }

    case RECEIVE_ADD_PRODUCT_PRICING_AND_ACCESS: {
      if (action.payload.type === "conference") {
        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            conference_product: {
              ...state.execute_migration.conference_product,
              product_pricing_created: true,
            },
          },
        };
      } else if (action.payload.type === "session") {
        let session_products = {};
        action.payload.type_ids.forEach((sessionid, index) => {
          session_products[sessionid] = {
            ...state.execute_migration.session_products[sessionid],
            product_pricing_created: true,
          };
        });

        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            session_products: {
              ...state.execute_migration.session_products,
              ...session_products,
            },
          },
        };
      } else if (action.payload.type === "abstract") {
        let abstract_products = {};
        action.payload.type_ids.forEach((abstractid, index) => {
          abstract_products[abstractid] = {
            ...state.execute_migration.abstract_products[abstractid],
            product_pricing_created: true,
          };
        });

        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            abstract_products: {
              ...state.execute_migration.abstract_products,
              ...abstract_products,
            },
          },
        };
      } else {
        return { state };
      }
    }

    case RECEIVE_ADD_RELATION: {
      if (action.payload.type === "session") {
        let session_products = {};
        action.payload.type_ids.forEach((sessionid, index) => {
          session_products[sessionid] = {
            ...state.execute_migration.session_products[sessionid],
            parent_relation_created: true,
          };
        });

        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            session_products: {
              ...state.execute_migration.session_products,
              ...session_products,
            },
          },
        };
      } else if (action.payload.type === "abstract") {
        let abstract_products = {};
        action.payload.type_ids.forEach((abstractid, index) => {
          abstract_products[abstractid] = {
            ...state.execute_migration.abstract_products[abstractid],
            parent_relation_created: true,
          };
        });

        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            abstract_products: {
              ...state.execute_migration.abstract_products,
              ...abstract_products,
            },
          },
        };
      } else {
        return { state };
      }
    }

    case RECEIVE_CLONE_FORM: {
      return {
        ...state,
        execute_migration: {
          ...state.execute_migration,
          global_status: {
            ...state.execute_migration.global_status,
            cloneFormCompleted: true,
          },
        },
      };
    }

    case RECEIVE_CONF_MENUS: {
      return {
        ...state,
        select_conference: {
          ...state.select_conference,
          menus: action.payload.data.data,
          menus_fetched: true,
        },
      };
    }

    case RECEIVE_LOADING_CONF_MENUS: {
      return {
        ...state,
        select_conference: {
          ...state.select_conference,
          menus_fetched: !action.payload,
        },
      };
    }

    case RECEIVE_FETCH_ADD_PROD_CATEGORY: {
      return {
        ...state,
        execute_migration: {
          ...state.execute_migration,
          global_status: {
            ...state.execute_migration.global_status,
            product_category_fetched: true,
          },
          product_category_id: action.payload.data.CategoryID,
        },
      };
    }

    case RECEIVE_PERFORM_ROLLBACK: {
      if (action.payload.response?.data?.success == 0) {
        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            global_status: {
              ...state.execute_migration.global_status,
              rollbackCompleted: false,
              rollbackFailed: true,
            },
          },
        };
      } else {
        return {
          ...state,
          execute_migration: {
            ...state.execute_migration,
            global_status: {
              ...state.execute_migration.global_status,
              rollbackCompleted: true,
              rollbackFailed: false,
            },
          },
        };
      }
    }
    case RECEIVE_UPLOAD_TO_S3: {
      return {
        ...state,
        conference_pricing: {
          ...state.conference_pricing,
          image_url: action.payload.url,
        },
      };
    }

    case RECEIVE_CREDIT_DETAILS: {
      return {
        ...state,
        evaluation_credits: {
          ...state.evaluation_credits,
          credit_details: action.payload.data.data,
          credit_details_fetched: true,
        },
      };
    }
    case RECEIVE_FORM_DETAILS: {
      return {
        ...state,
        evaluation_credits: {
          ...state.evaluation_credits,
          form_details: action.payload.data.data,
          form_details_fetched: true,
        },
      };
    }
    case RECEIVE_STORE_CREDITS: {
      return {
        ...state,
        config: {
          ...state.config,
          credits: action.payload,
        },
        evaluation_credits: {
          ...state.evaluation_credits,
          visited: true,
        },
      };
    }
    case RECEIVE_STORE_EVALUATION_SESSIONS: {
      return {
        ...state,
        config: {
          ...state.config,
          evaluations: action.payload,
        },
        evaluation_credits: {
          ...state.evaluation_credits,
          visited: true,
        },
      };
    }
    case RECEIVE_CLEAR_EXECUTE_MIGRATION_STATE: {
      return {
        ...state,
        execute_migration: initExecutionState,
      };
    }

    case RECEIVE_FIX_FILE_SIZE: {
      //Do Nothing
      return { ...state };
    }
    case RECEIVE_STORE_WIZARD_CONFIG: {
      //Do Nothing
      return { ...state };
    }
    case RECEIVE_START_MIGRATION: {
      return { ...state, start_migration: true };
    }
    case RECEIVE_STOP_MIGRATION: {
      return { ...state, start_migration: false };
    }
    default:
      return state;
  }
};
