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

const initialState = {
    records: [],
    totalPages: 1,
    isLoading: false,
    error: null,
    isDeleting: false,
    record: null,
    materials: [],
    isDetailLoading: false,
    isMaterialsLoading: false,
    isSaving: false,
    detailError: null,
    saveError: null,
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
                    (record) => record.id !== action.payload
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

        case REQUEST_PURCHASE_RECORD:
            return {
                ...state,
                isDetailLoading: true,
                detailError: null,
            };

        case RECEIVE_PURCHASE_RECORD:
            return {
                ...state,
                record: action.payload,
                isDetailLoading: false,
                detailError: null,
            };

        case ERROR_PURCHASE_RECORD:
            return {
                ...state,
                isDetailLoading: false,
                detailError: action.payload,
            };

        case REQUEST_PURCHASE_MATERIALS:
            return {
                ...state,
                isMaterialsLoading: true,
                detailError: null,
            };

        case RECEIVE_PURCHASE_MATERIALS:
            return {
                ...state,
                materials: action.payload || [],
                isMaterialsLoading: false,
                detailError: null,
            };

        case ERROR_PURCHASE_MATERIALS:
            return {
                ...state,
                isMaterialsLoading: false,
                detailError: action.payload,
            };

        case REQUEST_SAVE_PURCHASE_RECORD:
            return {
                ...state,
                isSaving: true,
                saveError: null,
            };

        case SUCCESS_SAVE_PURCHASE_RECORD:
            return {
                ...state,
                isSaving: false,
                saveError: null,
            };

        case ERROR_SAVE_PURCHASE_RECORD:
            return {
                ...state,
                isSaving: false,
                saveError: action.payload,
            };

        case CLEAR_PURCHASE_RECORDS:
            return initialState;

        default:
            return state;
    }
}
