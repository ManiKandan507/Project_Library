import { all, call, fork, put, takeEvery, select } from "redux-saga/effects";
import _isEmpty from "lodash/isEmpty";
import {
  REQUEST_ALL_CONFERENCES,
  REQUEST_ALL_STORES,
  REQUEST_SESSION_TYPES,
  REQUEST_ALL_SESSIONS,
  REQUEST_CONTACT_GROUPS,
  REQUEST_ABSTRACT_MODULES,
  REQUEST_ABSTRACT_FIELDS,
  REQUEST_ABSTRACTS,
  REQUEST_SESSION_ABSTRACT_CONFIG,
  REQUEST_ATTENDEE_GROUPS,
  REQUEST_ADD_PRODUCTS,
  REQUEST_CONF_MENUS,
  REQUEST_FETCH_ADD_PROD_CATEGORY,
  REQUEST_ADD_PRODUCT_PRICING_AND_ACCESS,
  REQUEST_ADD_RELATION,
  REQUEST_PERFORM_ROLLBACK,
  REQUEST_UPLOAD_TO_S3,
  REQUEST_ALL_SESSIONS_DETAILS,
  REQUEST_SEND_SLACK_MESSAGE,
  REQUEST_FIX_FILE_SIZE,
  REQUEST_CREDIT_DETAILS,
  REQUEST_FORM_DETAILS,
  REQUEST_CLONE_FORM,
  REQUEST_STORE_WIZARD_CONFIG,
} from "../../constants/ActionTypes";

import {
  fetchError,
  migrationProcessError,
  receiveConferences,
  receiveStores,
  receiveSessionTypes,
  receiveAllSessions,
  receiveContactGroups,
  receiveAbstractModules,
  receiveAbstractFields,
  receiveAbstracts,
  receiveSessionAbstractConfig,
  receiveAttendeeGroups,
  receiveAddProducts,
  receiveConfMenus,
  receiveFetchAddProductCategory,
  receiveAddProductPricingAndAccess,
  receiveAddRelation,
  receivePerformRollback,
  receiveUploadToS3,
  receiveAllSessionsDetails,
  receiveSendSlackMessage,
  receiveFixFileSize,
  receiveGetCreditDetails,
  receiveGetFormDetails,
  receiveCloneForm,
  receiveStoreWizardConfig,
} from "../actions/Wizard";

import WizardAPIs from "../../api/wizard";
import _ from "lodash";
const fetchConferences = async context => {
  return await WizardAPIs.getConferences(context.payload);
};

const fetchStores = async context => {
  return await WizardAPIs.getStores(context.payload);
};

const fetchSessionTypes = async context => {
  return await WizardAPIs.getSessionTypes(
    context.payload.sourceHex,
    context.payload.uuid,
    context.payload.conferenceId
  );
};

const fetchAllSessions = async context => {
  return await WizardAPIs.getAllSessions(
    context.payload.sourceHex,
    context.payload.uuid,
    context.payload.conferenceId
  );
};

const fetchAllSessionsDetails = async context => {
  return await WizardAPIs.getAllSessionsDetails(
    context.payload.sourceHex,
    context.payload.uuid,
    context.payload.conferenceId
  );
};

const fetchContactGroups = async context => {
  return await WizardAPIs.getContactGroups(context.payload.appdir);
};
const fetchAttendeeGroups = async context => {
  return await WizardAPIs.getAttendeeGroups(
    context.payload.sourceHex,
    context.payload.ConferenceID
  );
};

const fetchAbstractModules = async context => {
  return await WizardAPIs.getAbstractModules(
    context.payload.sourceHex,
    context.payload.conferenceId
  );
};

const fetchAbstractFields = async context => {
  return await WizardAPIs.getAbstractFields(
    context.payload.sourceHex,
    context.payload.confIds
  );
};

const fetchAbstracts = async context => {
  return await WizardAPIs.getAbstracts(context.sourceHex, context.sessionID);
};

const fetchSessionAbstractConfig = async context => {
  try {
    return await WizardAPIs.getSessionAbstractConfig(
      context.sourceHex,
      context.model_type,
      context.id,
      context.body,
      context?.includeCredits,
      context?.includeEvaluation
    );
  } catch (error) {
    return {};
  }
};
const fetchAddProducts = async context => {
  return await WizardAPIs.postAddProducts(
    context.sourceHex,
    context.products,
    context.batchID
  );
};

const fetchAddProductPricing = async context => {
  return await WizardAPIs.postAddProductPricing(
    context.sourceHex,
    context.pricing,
    context.batchID
  );
};

const fetchAddProductAccess = async context => {
  return await WizardAPIs.postAddProductAccess(
    context.sourceHex,
    context.access,
    context.batchID
  );
};

const fetchAddRelation = async context => {
  return await WizardAPIs.postAddRelation(
    context.sourceHex,
    context.relations,
    context.batchID
  );
};
const fetchCloneForm = async context => {
  return await WizardAPIs.postCloneForm(
    context.sourceHex,
    context.appdir,
    context.evaluations,
    context.batchID
  );
};

const fetchPerformRollback = async context => {
  const rollbackResult = await WizardAPIs.postPerformRollback(
    context.payload.sourceHex,
    context.payload.product_ids
  );
  const config = context.payload.config;

  const cleanConfig = {
    conference: {
      ConferenceID: config?.conference?.ConferenceID,
      Confname: config.conference?.Confname,
    },
    store: {
      ConfID: config?.store?.ConfID,
      Eventname: config?.store?.Eventname,
      StoreID: config?.store?.StoreID,
    },
    menu: {
      MenuID: config?.menu?.MenuID,
      ConfID: config?.menu?.ConfID,
      Button: config?.menu?.Button,
    },
    session_list: config?.session_list?.map(session => {
      return { SessionID: session.SessionID, SessionName: session.SessionName };
    }),

    conference_pricing: config?.conference_pricing.map(pricing => {
      return {
        pricing_id: pricing?.pricing_id,
        scope: pricing?.scope,
        price: pricing?.price,
        price_label: pricing?.price_label,
        attendees: pricing?.attendees,
        groups: pricing?.groups?.map(group => {
          return { GroupID: group.GroupID, GroupName: group.GroupName };
        }),
      };
    }),

    session_pricing: config?.session_pricing.map(pricing => {
      return {
        pricing_id: pricing?.pricing_id,
        scope: pricing?.scope,
        session_price: pricing?.session_price,
        abstract_price: pricing?.abstract_price,
        attendees: pricing?.attendees,
        price_label: pricing?.price_label,
        sessions: pricing?.sessions?.map(session => {
          return {
            SessionID: session.SessionID,
            SessionName: session.SessionName,
          };
        }),
        groups: pricing?.groups?.map(group => {
          return { GroupID: group.GroupID, GroupName: group.GroupName };
        }),
      };
    }),
    abstract_fields: config?.abstract_fields,
    sell_session: config.sell_session,
    abstract_tag: config.abstract_tag,
    sell_abstract: config.sell_abstract,
  };

  await WizardAPIs.sendSlackMessage(
    JSON.stringify({
      module: "wizard",
      source_hex: context.payload.sourceHex,
      config: cleanConfig,
    })
  );
  return rollbackResult;
};

const fetchConfMenus = async context => {
  return await WizardAPIs.getConfMenus(
    context.payload.sourceHex,
    context.payload.ConfID
  );
};

const fetchFetchAddProductCategory = async context => {
  return await WizardAPIs.fetchFetchAddProductCategory(
    context.payload.sourceHex,
    context.payload.ConfID,
    context.payload.label
  );
};

const fetchS3signatureAndUpload = async context => {
  // key, bucket, content_type
  //FETCH SIGNATURE FOR S3 UPLOAD
  const result = await WizardAPIs.getS3Signature(
    context.payload.key,
    "amz.xcdsystem.com",
    context.payload["Content-Type"]
  );

  //UPLOAD TO S3
  const uploadResult = await WizardAPIs.uploadTos3(
    context.payload.key, //key
    "amz.xcdsystem.com", //bucket
    context.payload["Content-Type"], //Content Type
    context.payload.file, //File to Upload
    result // S3 sign params(policy, signature)
  );

  return uploadResult;
};

const fetchSendSlackMessage = async context => {
  const slackResponse = await WizardAPIs.sendSlackMessage(
    context.payload.message
  );
  return slackResponse;
};

const fetchFixFileSize = async context => {
  const fixFileSizeResult = await WizardAPIs.fixFileSize(
    context.payload.sourceHex
  );
  return fixFileSizeResult;
};

const fetchCreditDetails = async context => {
  const creditDetailsResponse = await WizardAPIs.getCreditDetails(
    context.payload.sourceHex,
    context.payload.conferenceId
  );
  return creditDetailsResponse;
};

const fetchFormDetails = async context => {
  const FormDetailsResponse = await WizardAPIs.getFormDetails(
    context.payload.sourceHex,
    context.payload.conferenceId,
    context.payload.sessionIDs
  );
  return FormDetailsResponse;
};

const fetchStoreWizardConfig = async context => {
  const storeWizardConfigResult = await WizardAPIs.storeWizardConfig(
    context.payload.sourceHex,
    context.payload.config,
    context.payload.conferenceid
  );
  return storeWizardConfigResult;
};

const getProductIDsForRollback = async stateExecuteMigration => {
  let product_ids = [];
  if (!_.isEmpty(stateExecuteMigration.conference_product)) {
    //Gather conference product ID
    product_ids.push(stateExecuteMigration.conference_product.product_id);
  }

  // Gather sessions product ID
  for (const [sessionID, sessionProductDetails] of Object.entries(
    stateExecuteMigration.session_products
  )) {
    product_ids.push(sessionProductDetails.product_id);
  }

  // Gather abstract product ID
  for (const [abstractID, abstractProductDetails] of Object.entries(
    stateExecuteMigration.abstract_products
  )) {
    product_ids.push(abstractProductDetails.product_id);
  }
  return product_ids;
};

function* getConferences(action) {
  try {
    const result = yield call(fetchConferences, action);
    yield put(receiveConferences(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getStores(action) {
  try {
    const result = yield call(fetchStores, action);
    yield put(receiveStores(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getSessionTypes(action) {
  try {
    const result = yield call(fetchSessionTypes, action);
    yield put(receiveSessionTypes(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getAllSessions(action) {
  try {
    const result = yield call(fetchAllSessions, action);
    yield put(receiveAllSessions(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getAllSessionsDetails(action) {
  try {
    const result = yield call(fetchAllSessionsDetails, action);
    yield put(receiveAllSessionsDetails(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getContactGroups(action) {
  try {
    const result = yield call(fetchContactGroups, action);
    yield put(receiveContactGroups(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getAttendeeGroups(action) {
  try {
    const result = yield call(fetchAttendeeGroups, action);
    yield put(receiveAttendeeGroups(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getAbstractModules(action) {
  try {
    const result = yield call(fetchAbstractModules, action);
    yield put(receiveAbstractModules(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getAbstractFields(action) {
  try {
    const result = yield call(fetchAbstractFields, action);
    yield put(receiveAbstractFields(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getAbstracts(action) {
  try {
    const result = yield all(
      action.payload.sessionIDs.map(sessionid =>
        call(fetchAbstracts, {
          sourceHex: action.payload.sourceHex,
          sessionID: sessionid,
        })
      )
    );
    yield put(receiveAbstracts(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getSessionAbstractConfig(action) {
  try {
    let configSessionBatches = [];
    let configAbstractBatches = [];
    const batchSize = 10;
    for (
      let i = 0, j = action.payload.sessionIDs.length;
      i < j;
      i += batchSize
    ) {
      configSessionBatches.push(
        action.payload.sessionIDs.slice(i, i + batchSize)
      );
    }
    for (
      let i = 0, j = action.payload.abstractIDs.length;
      i < j;
      i += batchSize
    ) {
      configAbstractBatches.push(
        action.payload.abstractIDs.slice(i, i + batchSize)
      );
    }

    const result_session = yield all(
      configSessionBatches.map(sessionBatch =>
        call(fetchSessionAbstractConfig, {
          sourceHex: action.payload.sourceHex,
          model_type: "session",
          id: sessionBatch,
          body: action.payload.body,
          includeCredits: action.payload?.includeCredits,
          includeEvaluation: action.payload?.includeEvaluation,
        })
      )
    );

    // const result_session = yield all(
    //   action.payload.sessionIDs.map(sessionid =>
    //     call(fetchSessionAbstractConfig, {
    //       sourceHex: action.payload.sourceHex,
    //       model_type: "session",
    //       id: [sessionid],
    //       body: action.payload.body,
    //     })
    //   )
    // );

    const result_abstract = yield all(
      configAbstractBatches.map(abstractBatch =>
        call(fetchSessionAbstractConfig, {
          sourceHex: action.payload.sourceHex,
          model_type: "abstract",
          id: abstractBatch,
          body: action.payload.body,
        })
      )
    );
    // const result_abstract = yield all(
    //   action.payload.abstractIDs.map(abstractid =>
    //     call(fetchSessionAbstractConfig, {
    //       sourceHex: action.payload.sourceHex,
    //       model_type: "abstract",
    //       id: [abstractid],
    //       body: action.payload.body,
    //     })
    //   )
    // );
    //Flatten the results
    const finalResultSession = [].concat.apply([], result_session);
    const finalResultAbstract = [].concat.apply([], result_abstract);

    yield put(
      receiveSessionAbstractConfig({
        session_configs: finalResultSession,
        abstract_configs: finalResultAbstract,
      })
    );
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getAddProducts(action) {
  try {
    let productsBatch = [];
    let finalProductIDs = [];
    let finalTypeIDs = [];
    let i,
      j,
      batchSize = 5,
      maxRetryCount = 2;
    for (i = 0, j = action.payload.products.length; i < j; i += batchSize) {
      productsBatch.push(action.payload.products.slice(i, i + batchSize));
    }

    // Sequential call for addProducts to maintain the OrderOf products(especially Abstracts)
    const addProductCalls = productsBatch.map((products, index) => {
      return call(fetchAddProducts, {
        sourceHex: action.payload.sourceHex,
        products,
        batchID: index,
      });
    });
    let result = [];
    for (let c of addProductCalls) {
      result.push(yield c);
    }

    let rollbackRequired = false;

    for (let retryCount = 1; retryCount <= maxRetryCount; retryCount++) {
      let retryProductCalls = [];
      //This should get executed at least once
      if (!_isEmpty(result)) {
        result.forEach(res => {
          if (res.response.data.success == 0) {
            //Add this batch for retry
            retryProductCalls.push(
              call(fetchAddProducts, {
                sourceHex: action.payload.sourceHex,
                products: res.products,
                batchID: res.batchID,
              })
            );
          } else {
            finalProductIDs.push(...res.response.data.data.ProductIDs);
            finalTypeIDs.push(
              ...action.payload.type_ids.slice(
                res.batchID * batchSize,
                res.batchID * batchSize + batchSize
              )
            );
          }
        });
        let retryResult = [];
        if (!_isEmpty(retryProductCalls)) {
          for (let c of retryProductCalls) {
            //Retrying the failed batch
            retryResult.push(yield c);
          }
        }
        result = retryResult;
      }
    }
    result.forEach(res => {
      if (res.response.data.success == 0) {
        //Failed after retrying multiple times
        rollbackRequired = true;
      } else {
        finalProductIDs.push(...res.response.data.data.ProductIDs);
        finalTypeIDs.push(
          ...action.payload.type_ids.slice(
            res.batchID * batchSize,
            res.batchID * batchSize + batchSize
          )
        );
      }
    });

    if (
      rollbackRequired ||
      finalProductIDs.length !== action.payload.type_ids.length
    ) {
      let stateExecuteMigration = yield select(
        state => state.wizard.execute_migration
      );
      let stateConfig = yield select(state => state.wizard.config);
      let product_ids = [];
      product_ids.push(...finalProductIDs);
      product_ids.push(
        ...(yield getProductIDsForRollback(stateExecuteMigration))
      );

      const rollbackResult = yield call(fetchPerformRollback, {
        payload: {
          sourceHex: action.payload.sourceHex,
          product_ids,
          config: stateConfig,
        },
      });
      yield put(receivePerformRollback(rollbackResult));
    } else {
      yield put(
        receiveAddProducts({
          type: action.payload.type,
          type_ids: finalTypeIDs,
          ProductIDs: finalProductIDs,
        })
      );
    }
  } catch (e) {
    yield put(migrationProcessError(e));
  }
}

function* getAddProductPricingAndAccess(action) {
  try {
    let pricingBatch = [];
    let accessBatch = [];
    let i,
      j,
      batchSize = 5,
      maxRetryCount = 2;
    for (i = 0, j = action.payload.pricing.length; i < j; i += batchSize) {
      pricingBatch.push(action.payload.pricing.slice(i, i + batchSize));
    }
    for (i = 0, j = action.payload.access.length; i < j; i += batchSize) {
      accessBatch.push(action.payload.access.slice(i, i + batchSize));
    }
    let resultPricing = yield all(
      pricingBatch.map((pricing, index) => {
        return call(fetchAddProductPricing, {
          sourceHex: action.payload.sourceHex,
          pricing: pricing,
          batchID: index,
        });
      })
    );

    let resultAccess = yield all(
      accessBatch.map((access, index) => {
        return call(fetchAddProductAccess, {
          sourceHex: action.payload.sourceHex,
          access: access,
          batchID: index,
        });
      })
    );

    for (let retryCount = 1; retryCount <= maxRetryCount; retryCount++) {
      let retryPricingBatch = [];
      //This should get executed at least once
      if (!_isEmpty(resultPricing)) {
        resultPricing.forEach(res => {
          if (res?.response?.data.success == 0) {
            //Add this batch for retry
            retryPricingBatch.push(
              call(fetchAddProductPricing, {
                sourceHex: action.payload.sourceHex,
                pricing: res.pricing,
                batchID: res.batchID,
              })
            );
          }
        });
        let retryResult = [];
        if (!_isEmpty(retryPricingBatch)) {
          for (let c of retryPricingBatch) {
            //Retrying the failed batch
            retryResult.push(yield c);
          }
        }
        resultPricing = retryResult;
      }
    }

    for (let retryCount = 1; retryCount <= maxRetryCount; retryCount++) {
      let retryAccessBatch = [];
      //This should get executed at least once
      if (!_isEmpty(resultAccess)) {
        resultAccess.forEach(res => {
          if (res?.response?.data.success == 0) {
            //Add this batch for retry
            retryAccessBatch.push(
              call(fetchAddProductAccess, {
                sourceHex: action.payload.sourceHex,
                access: res.access,
                batchID: res.batchID,
              })
            );
          }
        });
        let retryResult = [];
        if (!_isEmpty(retryAccessBatch)) {
          for (let c of retryAccessBatch) {
            //Retrying the failed batch
            retryResult.push(yield c);
          }
        }
        resultAccess = retryResult;
      }
    }

    let rollbackRequired = false;

    resultPricing.forEach(res => {
      if (res?.response?.data.success == 0) {
        rollbackRequired = true;
      }
    });

    resultAccess.forEach(res => {
      if (res.response.data.success == 0) {
        rollbackRequired = true;
      }
    });

    if (rollbackRequired) {
      let stateExecuteMigration = yield select(
        state => state.wizard.execute_migration
      );
      let stateConfig = yield select(state => state.wizard.config);
      let product_ids = yield getProductIDsForRollback(stateExecuteMigration);

      const rollbackResult = yield call(fetchPerformRollback, {
        payload: {
          sourceHex: action.payload.sourceHex,
          product_ids,
          config: stateConfig,
        },
      });
      yield put(receivePerformRollback(rollbackResult));
    } else {
      yield put(
        receiveAddProductPricingAndAccess({
          type: action.payload.type,
          type_ids: action.payload.type_ids,
          // result,
        })
      );
    }
  } catch (e) {
    yield put(migrationProcessError(e));
  }
}

function* getAddRelation(action) {
  try {
    let relationBatch = [];

    let i,
      j,
      batchSize = 5,
      maxRetryCount = 2;
    for (i = 0, j = action.payload.relations.length; i < j; i += batchSize) {
      relationBatch.push(action.payload.relations.slice(i, i + batchSize));
    }
    let result = yield all(
      relationBatch.map((relations, index) => {
        return call(fetchAddRelation, {
          sourceHex: action.payload.sourceHex,
          relations,
          batchID: index,
        });
      })
    );

    for (let retryCount = 1; retryCount <= maxRetryCount; retryCount++) {
      let retryBatch = [];
      //This should get executed at least once
      if (!_isEmpty(result)) {
        result.forEach(res => {
          if (res.response?.data?.success == 0) {
            //Add this batch for retry
            retryBatch.push(
              call(fetchAddRelation, {
                sourceHex: action.payload.sourceHex,
                relations: res.relations,
                batchID: res.batchID,
              })
            );
          }
        });
        let retryResult = [];
        if (!_isEmpty(retryBatch)) {
          for (let c of retryBatch) {
            //Retrying the failed batch
            retryResult.push(yield c);
          }
        }
        result = retryResult;
      }
    }

    let product_ids = [];
    let rollbackRequired = false;

    result.forEach(res => {
      if (res.response?.data?.success == 0) {
        rollbackRequired = true;
      }
    });
    if (rollbackRequired) {
      let stateExecuteMigration = yield select(
        state => state.wizard.execute_migration
      );
      let stateConfig = yield select(state => state.wizard.config);
      product_ids.push(
        ...(yield getProductIDsForRollback(stateExecuteMigration))
      );

      const rollbackResult = yield call(fetchPerformRollback, {
        payload: {
          sourceHex: action.payload.sourceHex,
          product_ids,
          config: stateConfig,
        },
      });
      yield put(receivePerformRollback(rollbackResult));
    } else {
      yield put(
        receiveAddRelation({
          type: action.payload.type,
          type_ids: action.payload.type_ids,
          // result,
        })
      );
    }
  } catch (e) {
    yield put(migrationProcessError(e));
  }
}
//TODO: update this properly based on the CF API response for retry
function* getCloneForm(action) {
  try {
    let evaluationBatch = [];

    let i,
      j,
      batchSize = 5,
      maxRetryCount = 2;
    for (i = 0, j = action.payload.evaluations.length; i < j; i += batchSize) {
      evaluationBatch.push(action.payload.evaluations.slice(i, i + batchSize));
    }
    let result = yield all(
      evaluationBatch.map((evaluations, index) => {
        return call(fetchCloneForm, {
          sourceHex: action.payload.sourceHex,
          appdir: action.payload.appdir,
          evaluations,
          batchID: index,
        });
      })
    );

    for (let retryCount = 1; retryCount <= maxRetryCount; retryCount++) {
      let retryBatch = [];
      //This should get executed at least once
      if (!_isEmpty(result)) {
        result.forEach(res => {
          if (res.response?.data?.success == 0) {
            //Add this batch for retry
            retryBatch.push(
              call(fetchCloneForm, {
                sourceHex: action.payload.sourceHex,
                appdir: action.payload.appdir,
                evaluations: res.evaluations,
                batchID: res.batchID,
              })
            );
          }
        });
        let retryResult = [];
        if (!_isEmpty(retryBatch)) {
          for (let c of retryBatch) {
            //Retrying the failed batch
            retryResult.push(yield c);
          }
        }
        result = retryResult;
      }
    }

    let product_ids = [];
    let rollbackRequired = false;

    result.forEach(res => {
      if (res.response?.data?.success == 0) {
        rollbackRequired = true;
      }
    });
    if (rollbackRequired) {
      let stateExecuteMigration = yield select(
        state => state.wizard.execute_migration
      );
      let stateConfig = yield select(state => state.wizard.config);
      product_ids.push(
        ...(yield getProductIDsForRollback(stateExecuteMigration))
      );

      const rollbackResult = yield call(fetchPerformRollback, {
        payload: {
          sourceHex: action.payload.sourceHex,
          product_ids,
          config: stateConfig,
        },
      });
      yield put(receivePerformRollback(rollbackResult));
    } else {
      yield put(
        receiveCloneForm({
          sessionIDs: action.payload.evaluations.map(evalu => evalu.sessionid),
          // result,
        })
      );
    }
  } catch (e) {
    yield put(migrationProcessError(e));
  }
}

function* getPerformRollback(action) {
  try {
    const result = yield call(fetchPerformRollback, action);
    yield put(receivePerformRollback(result));
  } catch (e) {
    console.log("In getPerformRollback", e);
    yield put(migrationProcessError(e));
  }
}

function* getConfMenus(action) {
  try {
    const result = yield call(fetchConfMenus, action);
    yield put(receiveConfMenus(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}
function* getFetchAddProductCategory(action) {
  try {
    const result = yield call(fetchFetchAddProductCategory, action);
    yield put(receiveFetchAddProductCategory(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getUploadToS3(action) {
  try {
    if (action.payload.key == "") {
      //The file has been deleted
      yield put(receiveUploadToS3({ payload: { url: "" } }));
    } else {
      const result = yield call(fetchS3signatureAndUpload, action);
      yield put(receiveUploadToS3(result));
    }
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getSendSlackMessage(action) {
  try {
    const result = yield call(fetchSendSlackMessage, action);
    yield put(receiveSendSlackMessage(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getFixFileSize(action) {
  try {
    const result = yield call(fetchFixFileSize, action);
    yield put(receiveFixFileSize(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getGetCreditDetails(action) {
  try {
    const result = yield call(fetchCreditDetails, action);
    yield put(receiveGetCreditDetails(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}
function* getGetFormDetails(action) {
  try {
    const result = yield call(fetchFormDetails, action);
    yield put(receiveGetFormDetails(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getStoreWizardConfig(action) {
  try {
    const result = yield call(fetchStoreWizardConfig, action);
    yield put(receiveStoreWizardConfig(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

export function* requestConferences() {
  yield takeEvery(REQUEST_ALL_CONFERENCES, getConferences);
}

export function* requestStores() {
  yield takeEvery(REQUEST_ALL_STORES, getStores);
}

export function* requestSessionTypes() {
  yield takeEvery(REQUEST_SESSION_TYPES, getSessionTypes);
}

export function* requestAllSessions() {
  yield takeEvery(REQUEST_ALL_SESSIONS, getAllSessions);
}

export function* requestAllSessionsDetails() {
  yield takeEvery(REQUEST_ALL_SESSIONS_DETAILS, getAllSessionsDetails);
}

export function* requestContactGroups() {
  yield takeEvery(REQUEST_CONTACT_GROUPS, getContactGroups);
}

export function* requestAbstractModules() {
  yield takeEvery(REQUEST_ABSTRACT_MODULES, getAbstractModules);
}

export function* requestAbstractFields() {
  yield takeEvery(REQUEST_ABSTRACT_FIELDS, getAbstractFields);
}

export function* requestAbstracts() {
  yield takeEvery(REQUEST_ABSTRACTS, getAbstracts);
}

export function* requestSessionAbstractConfig() {
  yield takeEvery(REQUEST_SESSION_ABSTRACT_CONFIG, getSessionAbstractConfig);
}
export function* requestAttendeeGroups() {
  yield takeEvery(REQUEST_ATTENDEE_GROUPS, getAttendeeGroups);
}

export function* requestAddProducts() {
  yield takeEvery(REQUEST_ADD_PRODUCTS, getAddProducts);
}

export function* requestConfMenus() {
  yield takeEvery(REQUEST_CONF_MENUS, getConfMenus);
}
export function* requestFetchAddProductCategory() {
  yield takeEvery(REQUEST_FETCH_ADD_PROD_CATEGORY, getFetchAddProductCategory);
}

export function* requestAddProductPricingAndAccess() {
  yield takeEvery(
    REQUEST_ADD_PRODUCT_PRICING_AND_ACCESS,
    getAddProductPricingAndAccess
  );
}

export function* requestAddRelation() {
  yield takeEvery(REQUEST_ADD_RELATION, getAddRelation);
}
export function* requestCloneForm() {
  yield takeEvery(REQUEST_CLONE_FORM, getCloneForm);
}

export function* requestPerformRollback() {
  yield takeEvery(REQUEST_PERFORM_ROLLBACK, getPerformRollback);
}

export function* requestUploadToS3() {
  yield takeEvery(REQUEST_UPLOAD_TO_S3, getUploadToS3);
}
export function* requestSendSlackMessage() {
  yield takeEvery(REQUEST_SEND_SLACK_MESSAGE, getSendSlackMessage);
}
export function* requestFixFileSize() {
  yield takeEvery(REQUEST_FIX_FILE_SIZE, getFixFileSize);
}
export function* requestGetCreditDetails() {
  yield takeEvery(REQUEST_CREDIT_DETAILS, getGetCreditDetails);
}
export function* requestStoreWizardConfig() {
  yield takeEvery(REQUEST_STORE_WIZARD_CONFIG, getStoreWizardConfig);
}

export function* requestGetFormDetails() {
  yield takeEvery(REQUEST_FORM_DETAILS, getGetFormDetails);
}
export default function* mySaga() {
  yield all([
    fork(requestConferences),
    fork(requestStores),
    fork(requestSessionTypes),
    fork(requestAllSessions),
    fork(requestAllSessionsDetails),
    fork(requestContactGroups),
    fork(requestAbstractModules),
    fork(requestAbstractFields),
    fork(requestAbstracts),
    fork(requestSessionAbstractConfig),
    fork(requestAttendeeGroups),
    fork(requestAddProducts),
    fork(requestConfMenus),
    fork(requestFetchAddProductCategory),
    fork(requestAddProductPricingAndAccess),
    fork(requestAddRelation),
    fork(requestPerformRollback),
    fork(requestUploadToS3),
    fork(requestSendSlackMessage),
    fork(requestFixFileSize),
    fork(requestGetCreditDetails),
    fork(requestGetFormDetails),
    fork(requestCloneForm),
    fork(requestStoreWizardConfig),
  ]);
}
