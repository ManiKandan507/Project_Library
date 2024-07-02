import {
  FETCH_ERROR,
  RECEIVE_NEXT_STEP,
  RECEIVE_PREVIOUS_STEP,
  RECEIVE_SET_STEP,
  REQUEST_ALL_CONFERENCES,
  RECEIVE_ALL_CONFERENCES,
  REQUEST_ALL_STORES,
  RECEIVE_ALL_STORES,
  RECEIVE_STORE_SELECTED_CONFERENCE,
  REQUEST_SESSION_TYPES,
  RECEIVE_SESSION_TYPES,
  REQUEST_ALL_SESSIONS,
  RECEIVE_ALL_SESSIONS,
  RECEIVE_STORE_SELECTED_SESSION_TYPES,
  REQUEST_CONTACT_GROUPS,
  RECEIVE_CONTACT_GROUPS,
  RECEIVE_STORE_CONFERENCE_PRICING,
  RECEIVE_STORE_SESSION_PRICING,
  REQUEST_ABSTRACT_MODULES,
  RECEIVE_ABSTRACT_MODULES,
  REQUEST_ABSTRACT_FIELDS,
  RECEIVE_ABSTRACT_FIELDS,
  RECEIVE_STORE_ABSTRACT_FIELDS,
  REQUEST_ABSTRACTS,
  RECEIVE_ABSTRACTS,
  REQUEST_SESSION_ABSTRACT_CONFIG,
  RECEIVE_SESSION_ABSTRACT_CONFIG,
  RECEIVE_UPDATE_CONFERENCE_DETAILS,
  REQUEST_ATTENDEE_GROUPS,
  RECEIVE_ATTENDEE_GROUPS,
  REQUEST_ADD_PRODUCTS,
  RECEIVE_ADD_PRODUCTS,
  REQUEST_CONF_MENUS,
  RECEIVE_CONF_MENUS,
  RECEIVE_LOADING_CONF_MENUS,
  REQUEST_FETCH_ADD_PROD_CATEGORY,
  RECEIVE_FETCH_ADD_PROD_CATEGORY,
  MIGRATION_FETCH_ERROR,
  REQUEST_ADD_PRODUCT_PRICING_AND_ACCESS,
  RECEIVE_ADD_PRODUCT_PRICING_AND_ACCESS,
  RECEIVE_ADD_RELATION,
  REQUEST_ADD_RELATION,
  REQUEST_PERFORM_ROLLBACK,
  RECEIVE_PERFORM_ROLLBACK,
  REQUEST_UPLOAD_TO_S3,
  RECEIVE_UPLOAD_TO_S3,
  REQUEST_ALL_SESSIONS_DETAILS,
  RECEIVE_ALL_SESSIONS_DETAILS,
  RECEIVE_CLEAR_EXECUTE_MIGRATION_STATE,
  RECEIVE_START_MIGRATION,
  RECEIVE_STOP_MIGRATION,
  REQUEST_SEND_SLACK_MESSAGE,
  RECEIVE_SEND_SLACK_MESSAGE,
  RECEIVE_STORE_CUSTOM_BUNDLES,
  RECEIVE_UPDATE_CUSTOM_BUNDLE_ABSTRACTS,
  REQUEST_FIX_FILE_SIZE,
  RECEIVE_FIX_FILE_SIZE,
  REQUEST_CREDIT_DETAILS,
  RECEIVE_CREDIT_DETAILS,
  REQUEST_FORM_DETAILS,
  RECEIVE_FORM_DETAILS,
  RECEIVE_STORE_CREDITS,
  RECEIVE_STORE_EVALUATION_SESSIONS,
  REQUEST_CLONE_FORM,
  RECEIVE_CLONE_FORM,
  REQUEST_STORE_WIZARD_CONFIG,
  RECEIVE_STORE_WIZARD_CONFIG,
} from "../../constants/ActionTypes";

export const fetchError = error => {
  return {
    type: FETCH_ERROR,
    payload: error,
  };
};

export const migrationProcessError = error => {
  return {
    type: MIGRATION_FETCH_ERROR,
    payload: error,
  };
};

export const requestNextStep = () => {
  return {
    type: RECEIVE_NEXT_STEP,
  };
};

export const requestPreviousStep = () => {
  return {
    type: RECEIVE_PREVIOUS_STEP,
  };
};

export const requestSetStep = data => {
  return {
    type: RECEIVE_SET_STEP,
    payload: data,
  };
};

export const requestStoreSelectedConference = data => {
  return {
    type: RECEIVE_STORE_SELECTED_CONFERENCE,
    payload: data,
  };
};

export const requestConferences = data => {
  return {
    type: REQUEST_ALL_CONFERENCES,
    payload: data,
  };
};

export const receiveConferences = data => {
  return {
    type: RECEIVE_ALL_CONFERENCES,
    payload: data,
  };
};

export const requestStores = data => {
  return {
    type: REQUEST_ALL_STORES,
    payload: data,
  };
};

export const receiveStores = data => {
  return {
    type: RECEIVE_ALL_STORES,
    payload: data,
  };
};

export const requestSessionTypes = data => {
  return {
    type: REQUEST_SESSION_TYPES,
    payload: data,
  };
};

export const receiveSessionTypes = data => {
  return {
    type: RECEIVE_SESSION_TYPES,
    payload: data,
  };
};

export const requestAllSessions = data => {
  return {
    type: REQUEST_ALL_SESSIONS,
    payload: data,
  };
};

export const receiveAllSessions = data => {
  return {
    type: RECEIVE_ALL_SESSIONS,
    payload: data,
  };
};

export const requestAllSessionsDetails = data => {
  return {
    type: REQUEST_ALL_SESSIONS_DETAILS,
    payload: data,
  };
};

export const receiveAllSessionsDetails = data => {
  return {
    type: RECEIVE_ALL_SESSIONS_DETAILS,
    payload: data,
  };
};

export const requestStoreSelectedSessionTypes = data => {
  return {
    type: RECEIVE_STORE_SELECTED_SESSION_TYPES,
    payload: data,
  };
};

export const requestContactGroups = data => {
  return {
    type: REQUEST_CONTACT_GROUPS,
    payload: data,
  };
};

export const receiveContactGroups = data => {
  return {
    type: RECEIVE_CONTACT_GROUPS,
    payload: data,
  };
};
export const requestStoreConferencePricing = data => {
  return {
    type: RECEIVE_STORE_CONFERENCE_PRICING,
    payload: data,
  };
};

export const requestStoreSessionPricing = data => {
  return {
    type: RECEIVE_STORE_SESSION_PRICING,
    payload: data,
  };
};

export const requestAbstractModules = data => {
  return {
    type: REQUEST_ABSTRACT_MODULES,
    payload: data,
  };
};

export const receiveAbstractModules = data => {
  return {
    type: RECEIVE_ABSTRACT_MODULES,
    payload: data,
  };
};
export const requestAbstractFields = data => {
  return {
    type: REQUEST_ABSTRACT_FIELDS,
    payload: data,
  };
};

export const receiveAbstractFields = data => {
  return {
    type: RECEIVE_ABSTRACT_FIELDS,
    payload: data,
  };
};

export const requestStoreAbstractFields = data => {
  return {
    type: RECEIVE_STORE_ABSTRACT_FIELDS,
    payload: data,
  };
};

export const requestStoreCustomBundles = data => {
  return {
    type: RECEIVE_STORE_CUSTOM_BUNDLES,
    payload: data,
  };
};

export const requestUpdateCustomBundleAbstracts = data => {
  return {
    type: RECEIVE_UPDATE_CUSTOM_BUNDLE_ABSTRACTS,
    payload: data,
  };
};

export const requestAbstracts = data => {
  return {
    type: REQUEST_ABSTRACTS,
    payload: data,
  };
};

export const receiveAbstracts = data => {
  return {
    type: RECEIVE_ABSTRACTS,
    payload: data,
  };
};
export const requestSessionAbstractConfig = data => {
  return {
    type: REQUEST_SESSION_ABSTRACT_CONFIG,
    payload: data,
  };
};
export const receiveSessionAbstractConfig = data => {
  return {
    type: RECEIVE_SESSION_ABSTRACT_CONFIG,
    payload: data,
  };
};

export const requestUpdateConferenceDetails = data => {
  return {
    type: RECEIVE_UPDATE_CONFERENCE_DETAILS,
    payload: data,
  };
};

export const requestAttendeeGroups = data => {
  return {
    type: REQUEST_ATTENDEE_GROUPS,
    payload: data,
  };
};

export const receiveAttendeeGroups = data => {
  return {
    type: RECEIVE_ATTENDEE_GROUPS,
    payload: data,
  };
};

export const requestAddProducts = data => {
  return {
    type: REQUEST_ADD_PRODUCTS,
    payload: data,
  };
};

export const receiveAddProducts = data => {
  return {
    type: RECEIVE_ADD_PRODUCTS,
    payload: data,
  };
};

export const requestConfMenus = data => {
  return {
    type: REQUEST_CONF_MENUS,
    payload: data,
  };
};

export const receiveConfMenus = data => {
  return {
    type: RECEIVE_CONF_MENUS,
    payload: data,
  };
};
export const requestLoadingConfMenus = data => {
  return {
    type: RECEIVE_LOADING_CONF_MENUS,
    payload: data,
  };
};
export const requestFetchAddProductCategory = data => {
  return {
    type: REQUEST_FETCH_ADD_PROD_CATEGORY,
    payload: data,
  };
};

export const receiveFetchAddProductCategory = data => {
  return {
    type: RECEIVE_FETCH_ADD_PROD_CATEGORY,
    payload: data,
  };
};

export const requestAddProductPricingAndAccess = data => {
  return {
    type: REQUEST_ADD_PRODUCT_PRICING_AND_ACCESS,
    payload: data,
  };
};

export const receiveAddProductPricingAndAccess = data => {
  return {
    type: RECEIVE_ADD_PRODUCT_PRICING_AND_ACCESS,
    payload: data,
  };
};

export const requestAddRelation = data => {
  return {
    type: REQUEST_ADD_RELATION,
    payload: data,
  };
};

export const receiveAddRelation = data => {
  return {
    type: RECEIVE_ADD_RELATION,
    payload: data,
  };
};

export const requestCloneForm = data => {
  return {
    type: REQUEST_CLONE_FORM,
    payload: data,
  };
};

export const receiveCloneForm = data => {
  return {
    type: RECEIVE_CLONE_FORM,
    payload: data,
  };
};

export const requestPerformRollback = data => {
  return {
    type: REQUEST_PERFORM_ROLLBACK,
    payload: data,
  };
};

export const receivePerformRollback = data => {
  return {
    type: RECEIVE_PERFORM_ROLLBACK,
    payload: data,
  };
};

export const requestUploadToS3 = data => {
  return {
    type: REQUEST_UPLOAD_TO_S3,
    payload: data,
  };
};

export const receiveUploadToS3 = data => {
  return {
    type: RECEIVE_UPLOAD_TO_S3,
    payload: data,
  };
};

export const requestClearExecuteMigrationState = data => {
  return {
    type: RECEIVE_CLEAR_EXECUTE_MIGRATION_STATE,
    payload: data,
  };
};

export const requestStartMigration = data => {
  return {
    type: RECEIVE_START_MIGRATION,
    payload: data,
  };
};

export const requestStopMigration = data => {
  return {
    type: RECEIVE_STOP_MIGRATION,
    payload: data,
  };
};

export const requestSendSlackMessage = data => {
  return {
    type: REQUEST_SEND_SLACK_MESSAGE,
    payload: data,
  };
};

export const receiveSendSlackMessage = data => {
  return {
    type: RECEIVE_SEND_SLACK_MESSAGE,
    payload: data,
  };
};

export const requestFixFileSize = data => {
  return {
    type: REQUEST_FIX_FILE_SIZE,
    payload: data,
  };
};

export const receiveFixFileSize = data => {
  return {
    type: RECEIVE_FIX_FILE_SIZE,
    payload: data,
  };
};

export const requestGetCreditDetails = data => {
  return {
    type: REQUEST_CREDIT_DETAILS,
    payload: data,
  };
};

export const receiveGetCreditDetails = data => {
  return {
    type: RECEIVE_CREDIT_DETAILS,
    payload: data,
  };
};

export const requestGetFormDetails = data => {
  return {
    type: REQUEST_FORM_DETAILS,
    payload: data,
  };
};

export const receiveGetFormDetails = data => {
  return {
    type: RECEIVE_FORM_DETAILS,
    payload: data,
  };
};
export const requestStoreCredits = data => {
  return {
    type: RECEIVE_STORE_CREDITS,
    payload: data,
  };
};

export const requestStoreEvaluationSessions = data => {
  return {
    type: RECEIVE_STORE_EVALUATION_SESSIONS,
    payload: data,
  };
};

export const requestStoreWizardConfig = data => {
  return {
    type: REQUEST_STORE_WIZARD_CONFIG,
    payload: data,
  };
};

export const receiveStoreWizardConfig = data => {
  return {
    type: RECEIVE_STORE_WIZARD_CONFIG,
    payload: data,
  };
};