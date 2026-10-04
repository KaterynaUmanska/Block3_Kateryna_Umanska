import {
    REQUEST_PURCHASE_RECORDS,
    RECEIVE_PURCHASE_RECORDS,
    ERROR_PURCHASE_RECORDS,
    CLEAR_PURCHASE_RECORDS,
    REQUEST_DELETE_PURCHASE_RECORD,
    SUCCESS_DELETE_PURCHASE_RECORD,
    ERROR_DELETE_PURCHASE_RECORD,
} from '../constants/actionTypes';

import {
    getPurchaseRecords,
    deletePurchaseRecord as deletePurchaseRecordRequest,
} from 'misc/requests/purchaseRecords';

const requestPurchaseRecords = () => ({
    type: REQUEST_PURCHASE_RECORDS,
});

const receivePurchaseRecords = (data) => ({
    type: RECEIVE_PURCHASE_RECORDS,
    payload: data,
});

const errorPurchaseRecords = (error) => ({
    type: ERROR_PURCHASE_RECORDS,
    payload: error,
});

const requestDeletePurchaseRecord = () => ({
    type: REQUEST_DELETE_PURCHASE_RECORD,
});

const successDeletePurchaseRecord = (id) => ({
    type: SUCCESS_DELETE_PURCHASE_RECORD,
    payload: id,
});

const errorDeletePurchaseRecord = (error) => ({
    type: ERROR_DELETE_PURCHASE_RECORD,
    payload: error,
});

const clearPurchaseRecords = () => ({
    type: CLEAR_PURCHASE_RECORDS,
});

const fetchPurchaseRecords = ({orderId, materialName, quantityFrom, quantityTo, page, size,}) => (dispatch) => {
    dispatch(requestPurchaseRecords());

    return getPurchaseRecords({
        orderId: orderId ? Number(orderId) : null,
        materialName: materialName || null,
        quantityFrom: quantityFrom
            ? Number(quantityFrom)
            : null,
        quantityTo: quantityTo
            ? Number(quantityTo)
            : null,
        page,
        size,
    })
        .then((response) => {
            dispatch(receivePurchaseRecords(response));
            return response;
        })
        .catch((error) => {
            dispatch(errorPurchaseRecords(error));
            return Promise.reject(error);
        });
};

const deletePurchaseRecord = (id) => (dispatch) => {
    dispatch(requestDeletePurchaseRecord());

    return deletePurchaseRecordRequest(id)
        .then(() => {
            dispatch(successDeletePurchaseRecord(id));
        })
        .catch((error) => {
            dispatch(errorDeletePurchaseRecord(error));
            return Promise.reject(error);
        });
};

export {
    fetchPurchaseRecords,
    deletePurchaseRecord,
    clearPurchaseRecords,
};