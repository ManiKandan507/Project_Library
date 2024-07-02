import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import _isEmpty from "lodash/isEmpty";
import {
  REQUEST_ABSTRACT_FIELDS,
  REQUEST_ABSTRACT_MODULES,
  REQUEST_FIX_FILE_SIZE,
  REQUEST_MAIN_PRODUCT_DETAILS,
  REQUEST_PRODUCT_DESCENDANTS,
  REQUEST_PRODUCT_DETAILS,
  REQUEST_SESSION_ABSTRACT_CONFIG,
  REQUEST_UPDATE_PRODUCTS,
  REQUEST_WIZARD_CONFIG,
} from "../../constants/ActionTypes";

import {
  fetchError,
  receiveAbstractFields,
  receiveAbstractModules,
  receiveFixFileSize,
  receiveMainProductDetails,
  receiveProductDescendants,
  receiveProductDetails,
  receiveSessionAbstractConfig,
  receiveUpdateProducts,
  receiveWizardConfig,
} from "../actions/SyncECommerceProducts";

import syncProductsAPIs from "../../api/syncecommerceproducts";

const fetchProductDetails = async context => {
  return await syncProductsAPIs.getProductDetails(
    context.payload.sourceHex,
    context.payload.productID
  );
};
const fetchAbstractModules = async context => {
  return await syncProductsAPIs.getAbstractModules(
    context.payload.sourceHex,
    context.payload.conferenceId
  );
};

const fetchAbstractFields = async context => {
  return await syncProductsAPIs.getAbstractFields(
    context.payload.sourceHex,
    context.payload.confIds
  );
};

const fetchWizardConfig = async context => {
  return await syncProductsAPIs.getWizardConfig(
    context.payload.sourceHex,
    context.payload.conferenceId
  );
};

const fetchProductDescendants = async context => {
  return await syncProductsAPIs.getProductDescendants(
    context.payload.sourceHex,
    context.payload.productID
  );
};

const fetchSessionAbstractConfig = async context => {
  try {
    return await syncProductsAPIs.getSessionAbstractConfig(
      context.sourceHex,
      context.model_type,
      context.id,
      context.body
    );
  } catch (error) {
    return {};
  }
};
const fetchUpdateProducts = async context => {
  return await syncProductsAPIs.getUpdateProducts(
    context.sourceHex,
    context.products
  );
};

const fetchFixFileSize = async context => {
  const fixFileSizeResult = await syncProductsAPIs.fixFileSize(
    context.payload.sourceHex
  );
  return fixFileSizeResult;
};

function* getMainProductDetails(action) {
  try {
    const result = yield call(fetchProductDetails, action);
    yield put(receiveMainProductDetails(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getProductDetails(action) {
  try {
    let maxRetryCount = 2;
    let result_products = yield all(
      action.payload.productIDs.map(prodID =>
        call(fetchProductDetails, {
          payload: {
            sourceHex: action.payload.sourceHex,
            productID: prodID,
          },
        })
      )
    );
    //Flatten the results
    const finalResult = [].concat.apply([], result_products);

    yield put(
      receiveProductDetails({
        productIDs: action.payload.productIDs,
        productDetails: finalResult,
      })
    );
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

function* getProductDescendants(action) {
  try {
    const result = yield call(fetchProductDescendants, action);
    yield put(receiveProductDescendants(result));
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
        })
      )
    );

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

    //Flatten the results
    const finalResultSession = [].concat.apply([], result_session);
    const finalResultAbstract = [].concat.apply([], result_abstract);

    yield put(
      receiveSessionAbstractConfig({
        sessionProductIDs: action.payload.sessionProductIDs,
        abstractProductIDs: action.payload.abstractProductIDs,
        session_configs: finalResultSession,
        abstract_configs: finalResultAbstract,
      })
    );
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getUpdateProducts(action) {
  try {
    let updateProductBatches = [];
    const batchSize = 10;
    let maxRetryCount = 2;
    for (let i = 0, j = action.payload.products.length; i < j; i += batchSize) {
      updateProductBatches.push(
        action.payload.products.slice(i, i + batchSize)
      );
    }

    const result_product = yield all(
      updateProductBatches.map(productBatch =>
        call(fetchUpdateProducts, {
          sourceHex: action.payload.sourceHex,
          products: productBatch,
        })
      )
    );

    for (let retryCount = 1; retryCount <= maxRetryCount; retryCount++) {
      let retryUpdateProductBatches = [];
      if (!_isEmpty(updateProductBatches)) {
        result_product.forEach(res => {
          if (res?.data?.success == 0) {
            retryUpdateProductBatches.push(
              call(fetchUpdateProducts, {
                sourceHex: action.payload.sourceHex,
                products: res.productBatch,
              })
            );
          }
        });
        let retryResult = [];
        if (!_isEmpty(retryUpdateProductBatches)) {
          for (let c of retryUpdateProductBatches) {
            retryResult.push(yield c);
          }
        }
      }
    }

    const finalResultUpdateProducts = [].concat.apply([], result_product);
    let success = 1;
    finalResultUpdateProducts.forEach(result => {
      if (result.data.success != 1) {
        success = 0;
      }
    });
    yield put(receiveUpdateProducts({ success }));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getWizardConfig(action) {
  try {
    const result = yield call(fetchWizardConfig, action);
    yield put(receiveWizardConfig(result?.data));
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

export function* requestMainProductDetails() {
  yield takeEvery(REQUEST_MAIN_PRODUCT_DETAILS, getMainProductDetails);
}

export function* requestProductDetails() {
  yield takeEvery(REQUEST_PRODUCT_DETAILS, getProductDetails);
}

export function* requestAbstractModules() {
  yield takeEvery(REQUEST_ABSTRACT_MODULES, getAbstractModules);
}

export function* requestAbstractFields() {
  yield takeEvery(REQUEST_ABSTRACT_FIELDS, getAbstractFields);
}

export function* requestProductDescendants() {
  yield takeEvery(REQUEST_PRODUCT_DESCENDANTS, getProductDescendants);
}
export function* requestSessionAbstractConfig() {
  yield takeEvery(REQUEST_SESSION_ABSTRACT_CONFIG, getSessionAbstractConfig);
}

export function* requestUpdateProducts() {
  yield takeEvery(REQUEST_UPDATE_PRODUCTS, getUpdateProducts);
}

export function* requestWizardConfig() {
  yield takeEvery(REQUEST_WIZARD_CONFIG, getWizardConfig);
}
export function* requestFixFileSize() {
  yield takeEvery(REQUEST_FIX_FILE_SIZE, getFixFileSize);
}
export default function* mySaga() {
  yield all([
    fork(requestMainProductDetails),
    fork(requestProductDetails),
    fork(requestAbstractModules),
    fork(requestAbstractFields),
    fork(requestProductDescendants),
    fork(requestSessionAbstractConfig),
    fork(requestUpdateProducts),
    fork(requestWizardConfig),
    fork(requestFixFileSize),
  ]);
}
