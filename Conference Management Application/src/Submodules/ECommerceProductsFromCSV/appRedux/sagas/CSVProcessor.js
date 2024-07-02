import { all, call, fork, put, takeEvery } from "redux-saga/effects";

import {
  REQUEST_ALL_STORES,
  REQUEST_CREATE_PRODUCTS_CSV,
} from "../../constants/ActionTypes";

import {
  fetchError,
  receiveStores,
  receiveCreateProductsCSV,
} from "../actions/CSVProcessor";

import CSVProcessorAPIs from "../../api/csvprocessor";

const fetchStores = async context => {
  return await CSVProcessorAPIs.getStores(context.payload);
};

const fetchS3signatureAndUpload = async context => {
  // key, bucket, content_type
  //FETCH SIGNATURE FOR S3 UPLOAD
  const result = await CSVProcessorAPIs.getS3Signature(
    context.payload.key,
    "amz.xcdsystem.com",
    context.payload["Content-Type"]
  );

  //UPLOAD TO S3
  const uploadResult = await CSVProcessorAPIs.uploadTos3(
    context.payload.key, //key
    "amz.xcdsystem.com", //bucket
    context.payload["Content-Type"], //Content Type
    context.payload.file, //File to Upload
    result // S3 sign params(policy, signature)
  );

  return uploadResult;
};

const fetchCreateProductsCSV = async context => {
  const productsCreateResponse = await CSVProcessorAPIs.createProductsCSV(
    context.payload.sourceHex,
    context.payload.storeID,
    context.payload.confID,
    context.resultS3Upload.url
  );
  return productsCreateResponse;
};

function* getStores(action) {
  try {
    const result = yield call(fetchStores, action);
    yield put(receiveStores(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

function* getCreateProductsCSV(action) {
  try {
    const resultS3Upload = yield call(fetchS3signatureAndUpload, action);

    const result = yield call(fetchCreateProductsCSV, {
      ...action,
      resultS3Upload,
    });
    yield put(receiveCreateProductsCSV(result));
  } catch (e) {
    yield put(fetchError(e));
  }
}

export function* requestStores() {
  yield takeEvery(REQUEST_ALL_STORES, getStores);
}

export function* requestCreateProductsCSV() {
  yield takeEvery(REQUEST_CREATE_PRODUCTS_CSV, getCreateProductsCSV);
}

export default function* mySaga() {
  yield all([fork(requestStores), fork(requestCreateProductsCSV)]);
}
