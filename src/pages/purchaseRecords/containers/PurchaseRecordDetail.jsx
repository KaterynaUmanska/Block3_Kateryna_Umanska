import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    MenuItem,
    Snackbar,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Button from 'components/Button';
import pageURLs from 'constants/pagesURLs';
import {
    getPurchaseRecord,
    getMaterials,
    updatePurchaseRecord,
    createPurchaseRecord,
} from 'misc/requests/purchaseRecords';

import { useIntl } from 'react-intl';

const isConflictError = (error) => {
    const status = error?.status || error?.response?.status;
    return Number(status) === 409;
};

function PurchaseRecordDetail() {
    const { formatMessage } = useIntl();

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

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

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setRequestError('');

                const materialsResponse = await getMaterials();
                setMaterials(materialsResponse || []);

                if (isCreateMode) {
                    setRecord(null);
                    setForm({
                        orderId: '',
                        materialId: '',
                        quantity: '',
                    });
                    setErrors({});
                    setMode('create');
                    return;
                }

                if (!id) {
                    setRequestError(
                        formatMessage({
                            id: 'purchaseRecords.error.notFound',
                        })
                    );
                    return;
                }

                const recordResponse =
                    await getPurchaseRecord(id);

                setRecord(recordResponse);

                setForm({
                    orderId: recordResponse.orderId,
                    materialId:
                        recordResponse.material?.id || '',
                    quantity: recordResponse.quantity,
                });

                setMode('view');
            } catch (error) {
                console.error(
                    'LOAD DETAIL ERROR:',
                    error
                );

                setRequestError(
                    formatMessage({
                        id: 'purchaseRecords.error.load',
                    })
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [
        id,
        isCreateMode,
        formatMessage,
    ]);

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
        materialId: Number(form.materialId),
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
                `${pageURLs.purchaseRecords}${
                    location.state?.listSearch || ''
                }`
            );
            return;
        }

        setForm({
            orderId: record.orderId,
            materialId:
                record.material?.id || '',
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
                await createPurchaseRecord(
                    getPreparedData()
                );

            navigate(
                `${pageURLs.purchaseRecords}/${createdRecord.id}`,
                {
                    replace: true,
                    state: {
                        listSearch:
                            location.state
                                ?.listSearch ||
                            '',
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
            await updatePurchaseRecord(
                id,
                getPreparedData()
            );

            const updatedRecord =
                await getPurchaseRecord(id);

            setRecord(updatedRecord);

            setForm({
                orderId:
                updatedRecord.orderId,
                materialId:
                    updatedRecord.material?.id ||
                    '',
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
            `${pageURLs.purchaseRecords}${
                location.state?.listSearch || ''
            }`
        );
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    if (!record && !isCreateMode) {
        return (
            <Box>
                <Alert severity="error">
                    {requestError}
                </Alert>

                <Box sx={{ marginTop: 2 }}>
                    <Button onClick={handleBack}>
                        {formatMessage({
                            id: 'purchaseRecords.back',
                        })}
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 700 }}>
            <Box
                sx={{
                    marginBottom: 2,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h5">
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
                </Typography>
            </Box>

            {mode === 'view' && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent:
                            'flex-end',
                        marginBottom: 2,
                    }}
                >
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
                </Box>
            )}

            {requestError && (
                <Alert
                    severity="error"
                    sx={{
                        marginBottom: 2,
                    }}
                >
                    {requestError}
                </Alert>
            )}

            {mode === 'view' && (
                <Box sx={{ pl: 4 }}>
                    <Typography
                        sx={{ marginBottom: 2 }}
                    >
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.id',
                            })}
                            :
                        </strong>{' '}
                        {record.id}
                    </Typography>

                    <Typography
                        sx={{ marginBottom: 2 }}
                    >
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.orderId',
                            })}
                            :
                        </strong>{' '}
                        {record.orderId}
                    </Typography>

                    <Typography
                        sx={{ marginBottom: 2 }}
                    >
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.material',
                            })}
                            :
                        </strong>{' '}
                        {record.material?.name}
                    </Typography>

                    <Typography
                        sx={{ marginBottom: 2 }}
                    >
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.unit',
                            })}
                            :
                        </strong>{' '}
                        {record.material?.unit}
                    </Typography>

                    <Typography
                        sx={{ marginBottom: 2 }}
                    >
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
                    </Typography>

                    <Typography
                        sx={{ marginBottom: 3 }}
                    >
                        <strong>
                            {formatMessage({
                                id: 'purchaseRecords.quantity',
                            })}
                            :
                        </strong>{' '}
                        {record.quantity}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: 3,
                        }}
                    >
                        <Button
                            onClick={handleBack}
                        >
                            {formatMessage({
                                id: 'purchaseRecords.back',
                            })}
                        </Button>
                    </Box>
                </Box>
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
                            id: 'purchaseRecords.material',
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
                                    value={
                                        material.id
                                    }
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

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            marginTop: 3,
                        }}
                    >
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
                    </Box>
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
        </Box>
    );
}

export default PurchaseRecordDetail;