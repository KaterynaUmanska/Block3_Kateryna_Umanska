import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Alert from 'components/Alert';
import CircularProgress from 'components/CircularProgress';
import IconButton from 'components/IconButton';
import MenuItem from 'components/MenuItem';
import Snackbar from 'components/Snackbar';
import TextField from 'components/TextField';
import Tooltip from 'components/Tooltip';

import {
    PurchaseRecordBox,
    PurchaseRecordTitle,
    PurchaseRecordField,
    PurchaseRecordAlert,
} from '../components/Styled';

import EditIcon from 'components/icons/Edit';

import {
    useLocation,
    useParams,
} from 'react-router-dom';

import Button from 'components/Button';

import pageURLs from 'constants/pagesURLs';

import {
    fetchPurchaseRecord,
    fetchPurchaseMaterials,
    updatePurchaseRecord,
    createPurchaseRecord,
} from 'app/actions/purchaseRecords';

import useLanguageNavigate from 'misc/hooks/useLanguageNavigate';

import { useIntl } from 'react-intl';

const LIST_STATE_KEY = 'purchase-records-list-state';

const isConflictError = (error) => {
    const status =
        error?.status ||
        error?.response?.status;

    return Number(status) === 409;
};

function PurchaseRecordDetail() {
    const { formatMessage } = useIntl();
    const dispatch = useDispatch();

    const {
        record: reduxRecord,
        materials: reduxMaterials,
    } = useSelector((state) => state.purchaseRecords);

    const { id } = useParams();
    const location = useLocation();
    const navigate = useLanguageNavigate();

    const isCreateMode =
        location.pathname.endsWith('/new') ||
        id === 'new';

    const [mode, setMode] = useState(
        isCreateMode ? 'create' : 'view'
    );

    const [record, setRecord] = useState(null);
    const [materials, setMaterials] = useState([]);

    const [form, setForm] = useState({
        orderId: '',
        materialId: '',
        quantity: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const getListSearch = () =>
        location.state?.listSearch ||
        sessionStorage.getItem(LIST_STATE_KEY) ||
        '';

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setRequestError('');

                await dispatch(fetchPurchaseMaterials());

                if (isCreateMode) {
                    if (!cancelled) {
                        setRecord(null);
                        setForm({
                            orderId: '',
                            materialId: '',
                            quantity: '',
                        });
                        setErrors({});
                        setMode('create');
                    }
                    return;
                }

                if (!id) {
                    return;
                }

                const recordResponse = await dispatch(
                    fetchPurchaseRecord(id)
                );

                if (!cancelled) {
                    setRecord(recordResponse);
                    setForm({
                        orderId: recordResponse.orderId,
                        materialId:
                            recordResponse.material?.id != null
                                ? String(recordResponse.material.id)
                                : '',
                        quantity: recordResponse.quantity,
                    });
                    setMode('view');
                }
            } catch (error) {
                console.error('LOAD DETAIL ERROR:', error);

                if (!cancelled) {
                    setRequestError(
                        formatMessage({
                            id: 'purchaseRecords.error.load',
                        })
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [
        dispatch,
        id,
        isCreateMode,
        formatMessage,
    ]);

    useEffect(() => {
        if (reduxRecord && !isCreateMode && String(reduxRecord.id) === String(id)) {
            setRecord(reduxRecord);
        }
    }, [reduxRecord, id, isCreateMode]);

    useEffect(() => {
        setMaterials(reduxMaterials || []);
    }, [reduxMaterials]);

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(
                location.state.successMessage
            );

            navigate(location.pathname, {
                replace: true,
                state: {
                    listSearch:
                        location.state?.listSearch ||
                        sessionStorage.getItem(
                            LIST_STATE_KEY
                        ) ||
                        '',
                },
            });
        }
    }, [
        location,
        navigate,
    ]);

    const handleChange = (field) => (event) => {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: event.target.value,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            [field]: '',
        }));

        setRequestError('');
    };

    const validate = () => {
        const validationErrors = {};

        if (!form.orderId) {
            validationErrors.orderId =
                formatMessage({
                    id: 'purchaseRecords.validation.orderIdRequired',
                });
        } else if (
            !/^\d+$/.test(
                String(form.orderId)
            ) ||
            Number(form.orderId) <= 0
        ) {
            validationErrors.orderId =
                formatMessage({
                    id: 'purchaseRecords.validation.orderIdInvalid',
                });
        }

        if (!form.materialId) {
            validationErrors.materialId =
                formatMessage({
                    id: 'purchaseRecords.validation.materialRequired',
                });
        }

        if (!form.quantity) {
            validationErrors.quantity =
                formatMessage({
                    id: 'purchaseRecords.validation.quantityRequired',
                });
        } else if (
            !/^\d+([.,]\d+)?$/.test(
                String(form.quantity)
            ) ||
            Number(
                String(form.quantity).replace(
                    ',',
                    '.'
                )
            ) <= 0
        ) {
            validationErrors.quantity =
                formatMessage({
                    id: 'purchaseRecords.validation.quantityInvalid',
                });
        }

        setErrors(validationErrors);

        return (
            Object.keys(validationErrors).length === 0
        );
    };

    const getPreparedData = () => ({
        orderId: Number(form.orderId),

        materialId: Number(
            form.materialId
        ),

        quantity: Number(
            String(form.quantity).replace(
                ',',
                '.'
            )
        ),
    });

    const handleEdit = () => {
        setErrors({});
        setRequestError('');
        setMode('edit');
    };

    const handleCancel = () => {
        if (isCreateMode) {
            navigate(
                `${pageURLs.purchaseRecords}${getListSearch()}`
            );

            return;
        }

        setForm({
            orderId: record.orderId,

            materialId:
                record.material?.id != null
                    ? String(
                        record.material.id
                    )
                    : '',

            quantity: record.quantity,
        });

        setErrors({});
        setRequestError('');
        setMode('view');
    };

    const handleCreate = async () => {
        if (!validate()) {
            return;
        }

        setIsSaving(true);
        setRequestError('');

        try {
            const createdRecord =
                await dispatch(
                    createPurchaseRecord(
                        getPreparedData()
                    )
                );

            navigate(
                `${pageURLs.purchaseRecords}/${createdRecord.id}`,
                {
                    replace: true,
                    state: {
                        listSearch:
                            getListSearch(),

                        successMessage:
                            formatMessage({
                                id: 'purchaseRecords.success.created',
                            }),
                    },
                }
            );
        } catch (error) {
            console.error(
                'CREATE ERROR:',
                error
            );

            if (isConflictError(error)) {
                setRequestError(
                    formatMessage({
                        id: 'purchaseRecords.error.conflict',
                    })
                );
            } else {
                setRequestError(
                    formatMessage({
                        id: 'purchaseRecords.error.create',
                    })
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        setIsSaving(true);
        setRequestError('');

        try {
            const updatedRecord =
                await dispatch(
                    updatePurchaseRecord(
                        id,
                        getPreparedData()
                    )
                );

            setRecord(updatedRecord);

            setForm({
                orderId:
                updatedRecord.orderId,

                materialId:
                    updatedRecord.material?.id != null
                        ? String(
                            updatedRecord.material.id
                        )
                        : '',

                quantity:
                updatedRecord.quantity,
            });

            setMode('view');

            setSuccessMessage(
                formatMessage({
                    id: 'purchaseRecords.success.updated',
                })
            );
        } catch (error) {
            console.error(
                'UPDATE ERROR:',
                error
            );

            if (isConflictError(error)) {
                setRequestError(
                    formatMessage({
                        id: 'purchaseRecords.error.conflict',
                    })
                );
            } else {
                setRequestError(
                    formatMessage({
                        id: 'purchaseRecords.error.update',
                    })
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        navigate(
            `${pageURLs.purchaseRecords}${getListSearch()}`
        );
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    if (!record && !isCreateMode) {
        return (
            <PurchaseRecordBox>
                <Alert severity="error">
                    {requestError}
                </Alert>

                <PurchaseRecordBox variant="errorBack">
                    <Button onClick={handleBack}>
                        {formatMessage({
                            id: 'purchaseRecords.back',
                        })}
                    </Button>
            </PurchaseRecordBox>
            </PurchaseRecordBox>
    );
    }

    return (
        <PurchaseRecordBox variant="detailRoot">
            <PurchaseRecordBox variant="detailTitle">
                <PurchaseRecordTitle align="center">
                    {mode === 'create'
                        ? formatMessage({
                            id: 'purchaseRecords.create',
                        })
                        : mode === 'edit'
                            ? formatMessage({
                                id: 'purchaseRecords.edit',
                            })
                            : formatMessage({
                                id: 'purchaseRecords.view',
                            })}
                </PurchaseRecordTitle>
            </PurchaseRecordBox>

            {mode === 'view' && (
                <PurchaseRecordBox variant="detailEditActions">
                    <Tooltip
                        title={formatMessage({
                            id: 'purchaseRecords.editButton',
                        })}
                    >
                        <IconButton
                            onClick={handleEdit}
                            aria-label={formatMessage({
                                id: 'purchaseRecords.editButton',
                            })}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </PurchaseRecordBox>
            )}

            {requestError && (
                <PurchaseRecordAlert variant="errorWithMargin" severity="error">
                    {requestError}
                </PurchaseRecordAlert>
            )}

            {mode === 'view' && (
                <PurchaseRecordBox variant="detailFields">
                    <PurchaseRecordField emphasized>
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.id',
                            })}
                            :
                        </strong>{' '}
                        {record.id}
                    </PurchaseRecordField>

                    <PurchaseRecordField>
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.orderId',
                            })}
                            :
                        </strong>{' '}
                        {record.orderId}
                    </PurchaseRecordField>

                    <PurchaseRecordField>
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.materialName',
                            })}
                            :
                        </strong>{' '}
                        {record.material?.name}
                    </PurchaseRecordField>

                    <PurchaseRecordField>
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.unit',
                            })}
                            :
                        </strong>{' '}
                        {record.material?.unit}
                    </PurchaseRecordField>

                    <PurchaseRecordField>
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.materialDescription',
                            })}
                            :
                        </strong>{' '}
                        {record.material?.description ||
                            formatMessage({
                                id: 'purchaseRecords.emptyDescription',
                            })}
                    </PurchaseRecordField>

                    <PurchaseRecordField last>
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.quantity',
                            })}
                            :
                        </strong>{' '}
                        {record.quantity}
                    </PurchaseRecordField>

                    <PurchaseRecordBox variant="detailBack">
                        <Button onClick={handleBack}>
                            {formatMessage({
                                id: 'purchaseRecords.back',
                            })}
                        </Button>
                    </PurchaseRecordBox>
                </PurchaseRecordBox>
            )}

            {(mode === 'edit' ||
                mode === 'create') && (
                <>
                    <TextField
                        fullWidth
                        label={formatMessage({
                            id: 'purchaseRecords.orderId',
                        })}
                        margin="normal"
                        value={form.orderId}
                        error={Boolean(
                            errors.orderId
                        )}
                        helperText={
                            errors.orderId
                        }
                        onChange={handleChange(
                            'orderId'
                        )}
                    />

                    <TextField
                        fullWidth
                        select
                        label={formatMessage({
                            id: 'purchaseRecords.materialName',
                        })}
                        margin="normal"
                        value={form.materialId}
                        error={Boolean(
                            errors.materialId
                        )}
                        helperText={
                            errors.materialId
                        }
                        onChange={handleChange(
                            'materialId'
                        )}
                    >
                        <MenuItem value="">
                            {formatMessage({
                                id: 'purchaseRecords.selectMaterial',
                            })}
                        </MenuItem>

                        {materials.map(
                            (material) => (
                                <MenuItem
                                    key={
                                        material.id
                                    }
                                    value={String(
                                        material.id
                                    )}
                                >
                                    {material.name}
                                </MenuItem>
                            )
                        )}
                    </TextField>

                    <TextField
                        fullWidth
                        label={formatMessage({
                            id: 'purchaseRecords.quantity',
                        })}
                        margin="normal"
                        type="number"
                        value={form.quantity}
                        error={Boolean(
                            errors.quantity
                        )}
                        helperText={
                            errors.quantity
                        }
                        onChange={handleChange(
                            'quantity'
                        )}
                    />

                    <PurchaseRecordBox variant="detailFormActions">
                        <Button
                            disabled={isSaving}
                            onClick={
                                mode === 'create'
                                    ? handleCreate
                                    : handleSave
                            }
                        >
                            {mode === 'create'
                                ? formatMessage({
                                    id: 'purchaseRecords.createButton',
                                })
                                : formatMessage({
                                    id: 'purchaseRecords.save',
                                })}
                        </Button>

                        <Button
                            disabled={isSaving}
                            onClick={handleCancel}
                        >
                            {formatMessage({
                                id: 'purchaseRecords.cancel',
                            })}
                        </Button>
                    </PurchaseRecordBox>
                </>
            )}

            <Snackbar
                open={Boolean(
                    successMessage
                )}
                autoHideDuration={3000}
                onClose={() =>
                    setSuccessMessage('')
                }
            >
                <Alert
                    severity="success"
                    onClose={() =>
                        setSuccessMessage('')
                    }
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </PurchaseRecordBox>
    );
}

export default PurchaseRecordDetail;