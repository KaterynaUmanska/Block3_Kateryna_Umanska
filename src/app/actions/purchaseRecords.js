import {
    REQUEST_PURCHASE_RECORDS,
    RECEIVE_PURCHASE_RECORDS,
    ERROR_PURCHASE_RECORDS,
    CLEAR_PURCHASE_RECORDS,
    REQUEST_DELETE_PURCHASE_RECORD,
    SUCCESS_DELETE_PURCHASE_RECORD,
    ERROR_DELETE_PURCHASE_RECORD,
    REQUEST_PURCHASE_RECORD,
    RECEIVE_PURCHASE_RECORD,
    ERROR_PURCHASE_RECORD,
    REQUEST_PURCHASE_MATERIALS,
    RECEIVE_PURCHASE_MATERIALS,
    ERROR_PURCHASE_MATERIALS,
    REQUEST_SAVE_PURCHASE_RECORD,
    SUCCESS_SAVE_PURCHASE_RECORD,
    ERROR_SAVE_PURCHASE_RECORD,
} from '../constants/actionTypes';

import {
    getPurchaseRecord,
    getMaterials,
    getPurchaseRecords,
    deletePurchaseRecord as deletePurchaseRecordRequest,
    updatePurchaseRecord as updatePurchaseRecordRequest,
    createPurchaseRecord as createPurchaseRecordRequest,
} from 'misc/requests/purchaseRecords';

const fetchPurchaseRecords = ({
                                  orderId,
                                  materialName,
                                  quantityFrom,
                                  quantityTo,
                                  page,
                                  size,
                              }) => (dispatch) => {
    dispatch({ type: REQUEST_PURCHASE_RECORDS });

    return getPurchaseRecords({
        orderId: orderId ? Number(orderId) : null,
        materialName: materialName || null,
        quantityFrom: quantityFrom ? Number(quantityFrom) : null,
        quantityTo: quantityTo ? Number(quantityTo) : null,
        page,
        size,
    })
        .then((response) => {
            dispatch({
                type: RECEIVE_PURCHASE_RECORDS,
                payload: response,
            });
            return response;
        })
        .catch((error) => {
            dispatch({
                type: ERROR_PURCHASE_RECORDS,
                payload: error,
            });
            return Promise.reject(error);
        });
};

const deletePurchaseRecord = (id) => (dispatch) => {
    dispatch({ type: REQUEST_DELETE_PURCHASE_RECORD });

    return deletePurchaseRecordRequest(id)
        .then(() => {
            dispatch({
                type: SUCCESS_DELETE_PURCHASE_RECORD,
                payload: id,
            });
        })
        .catch((error) => {
            dispatch({
                type: ERROR_DELETE_PURCHASE_RECORD,
                payload: error,
            });
            return Promise.reject(error);
        });
};

const fetchPurchaseRecord = (id) => (dispatch) => {
    dispatch({ type: REQUEST_PURCHASE_RECORD });

    return getPurchaseRecord(id)
        .then((response) => {
            dispatch({
                type: RECEIVE_PURCHASE_RECORD,
                payload: response,
            });
            return response;
        })
        .catch((error) => {
            dispatch({
                type: ERROR_PURCHASE_RECORD,
                payload: error,
            });
            return Promise.reject(error);
        });
};

const fetchPurchaseMaterials = () => (dispatch) => {
    dispatch({ type: REQUEST_PURCHASE_MATERIALS });

    return getMaterials()
        .then((response) => {
            dispatch({
                type: RECEIVE_PURCHASE_MATERIALS,
                payload: response,
            });
            return response;
        })
        .catch((error) => {
            dispatch({
                type: ERROR_PURCHASE_MATERIALS,
                payload: error,
            });
            return Promise.reject(error);
        });
};

const updatePurchaseRecord = (id, data) => (dispatch) => {
    dispatch({ type: REQUEST_SAVE_PURCHASE_RECORD });

    return updatePurchaseRecordRequest(id, data)
        .then(() => getPurchaseRecord(id))
        .then((response) => {
            dispatch({
                type: RECEIVE_PURCHASE_RECORD,
                payload: response,
            });
            dispatch({
                type: SUCCESS_SAVE_PURCHASE_RECORD,
            });
            return response;
        })
        .catch((error) => {
            dispatch({
                type: ERROR_SAVE_PURCHASE_RECORD,
                payload: error,
            });
            return Promise.reject(error);
        });
};

const createPurchaseRecord = (data) => (dispatch) => {
    dispatch({ type: REQUEST_SAVE_PURCHASE_RECORD });

    return createPurchaseRecordRequest(data)
        .then((response) => {
            dispatch({
                type: RECEIVE_PURCHASE_RECORD,
                payload: response,
            });
            dispatch({
                type: SUCCESS_SAVE_PURCHASE_RECORD,
            });
            return response;
        })
        .catch((error) => {
            dispatch({
                type: ERROR_SAVE_PURCHASE_RECORD,
                payload: error,
            });
            return Promise.reject(error);
        });
};

const clearPurchaseRecords = () => ({
    type: CLEAR_PURCHASE_RECORDS,
});

export {
    fetchPurchaseRecords,
    deletePurchaseRecord,
    fetchPurchaseRecord,
    fetchPurchaseMaterials,
    updatePurchaseRecord,
    createPurchaseRecord,
    clearPurchaseRecords,
};
