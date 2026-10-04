import {
    REQUEST_PURCHASE_RECORDS,
    RECEIVE_PURCHASE_RECORDS,
    ERROR_PURCHASE_RECORDS,
    CLEAR_PURCHASE_RECORDS,
    REQUEST_DELETE_PURCHASE_RECORD,
    SUCCESS_DELETE_PURCHASE_RECORD,
    ERROR_DELETE_PURCHASE_RECORD,
} from '../constants/actionTypes';

const initialState = {
    records: [],
    totalPages: 1,
    isLoading: false,
    error: null,
    isDeleting: false,
};

export default function purchaseRecordsReducer(
    state = initialState,
    action
) {
    switch (action.type) {
        case REQUEST_PURCHASE_RECORDS:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case RECEIVE_PURCHASE_RECORDS:
            return {
                ...state,
                records: action.payload?.list || [],
                totalPages: action.payload?.totalPages || 1,
                isLoading: false,
                error: null,
            };

        case ERROR_PURCHASE_RECORDS:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case REQUEST_DELETE_PURCHASE_RECORD:
            return {
                ...state,
                isDeleting: true,
                error: null,
            };

        case SUCCESS_DELETE_PURCHASE_RECORD:
            return {
                ...state,
                records: state.records.filter(
                    (record) =>
                        record.id !== action.payload
                ),
                isDeleting: false,
                error: null,
            };

        case ERROR_DELETE_PURCHASE_RECORD:
            return {
                ...state,
                isDeleting: false,
                error: action.payload,
            };

        case CLEAR_PURCHASE_RECORDS:
            return initialState;

        default:
            return state;
    }
}