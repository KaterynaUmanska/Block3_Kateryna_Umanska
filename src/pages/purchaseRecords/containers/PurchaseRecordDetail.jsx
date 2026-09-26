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
} from 'misc/requests/purchaseRecords';

function PurchaseRecordDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [record, setRecord] = useState(null);
    const [materials, setMaterials] = useState([]);

    const [form, setForm] = useState({
        orderId: '',
        materialId: '',
        quantity: '',
    });

    const [mode, setMode] = useState('view');

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

                const [recordResponse, materialsResponse] =
                    await Promise.all([
                        getPurchaseRecord(id),
                        getMaterials(),
                    ]);

                setRecord(recordResponse);
                setMaterials(materialsResponse || []);

                setForm({
                    orderId: recordResponse.orderId,
                    materialId: recordResponse.material?.id || '',
                    quantity: recordResponse.quantity,
                });

                setMode('view');
            } catch (error) {
                setRequestError(
                    'Не вдалося завантажити запис про закупівлю.'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);

            navigate(location.pathname, {
                replace: true,
                state: {
                    listSearch: location.state?.listSearch || '',
                },
            });
        }
    }, [location, navigate]);

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
                'Order ID є обов’язковим.';
        } else if (Number(form.orderId) <= 0) {
            validationErrors.orderId =
                'Order ID має бути більше 0.';
        }

        if (!form.materialId) {
            validationErrors.materialId =
                'Матеріал є обов’язковим.';
        }

        if (!form.quantity) {
            validationErrors.quantity =
                'Кількість є обов’язковою.';
        } else if (Number(form.quantity) <= 0) {
            validationErrors.quantity =
                'Кількість має бути більше 0.';
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const handleEdit = () => {
        setErrors({});
        setRequestError('');
        setMode('edit');
    };

    const handleCancel = () => {
        setForm({
            orderId: record.orderId,
            materialId: record.material?.id || '',
            quantity: record.quantity,
        });

        setErrors({});
        setRequestError('');
        setMode('view');
    };

    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        setIsSaving(true);
        setRequestError('');

        const data = {
            orderId: Number(form.orderId),
            materialId: Number(form.materialId),
            quantity: Number(form.quantity),
        };

        try {
            await updatePurchaseRecord(id, data);

            const updatedRecord = await getPurchaseRecord(id);

            setRecord(updatedRecord);

            setForm({
                orderId: updatedRecord.orderId,
                materialId: updatedRecord.material?.id || '',
                quantity: updatedRecord.quantity,
            });

            setMode('view');
            setSuccessMessage(
                'Запис успішно відредаговано.'
            );
        } catch (error) {
            console.log('UPDATE ERROR:', error);

            if (error?.status === 409) {
                setRequestError(
                    'Даний матеріал вже входить до даної закупівлі.'
                );
            } else {
                setRequestError(
                    'Не вдалося зберегти зміни. Перевірте введені дані.'
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        navigate(
            `${pageURLs.purchaseRecords}${location.state?.listSearch || ''}`
        );
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    if (!record) {
        return (
            <Box>
                <Alert severity="error">
                    {requestError}
                </Alert>

                <Box sx={{ marginTop: 2 }}>
                    <Button onClick={handleBack}>
                        Назад
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ marginBottom: 3 }}>
                <Typography variant="h5">
                    Детальна інформація про запис
                </Typography>
            </Box>

            {requestError && (
                <Alert
                    severity="error"
                    sx={{ marginBottom: 2 }}
                >
                    {requestError}
                </Alert>
            )}

            {mode === 'view' && (
                <>
                    <Typography sx={{ marginBottom: 2 }}>
                        <strong>ID:</strong> {record.id}
                    </Typography>

                    <Typography sx={{ marginBottom: 2 }}>
                        <strong>Order ID:</strong> {record.orderId}
                    </Typography>

                    <Typography sx={{ marginBottom: 2 }}>
                        <strong>Матеріал:</strong>{' '}
                        {record.material?.name}
                    </Typography>

                    <Typography sx={{ marginBottom: 2 }}>
                        <strong>Одиниця виміру:</strong>{' '}
                        {record.material?.unit}
                    </Typography>

                    <Typography sx={{ marginBottom: 2 }}>
                        <strong>Опис матеріалу:</strong>{' '}
                        {record.material?.description || '—'}
                    </Typography>

                    <Typography sx={{ marginBottom: 3 }}>
                        <strong>Кількість:</strong>{' '}
                        {record.quantity}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 3,
                        }}
                    >
                        <Button onClick={handleBack}>
                            Назад
                        </Button>

                        <Tooltip title="Редагувати">
                            <IconButton
                                onClick={handleEdit}
                                aria-label="Редагувати"
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </>
            )}

            {mode === 'edit' && (
                <>
                    <TextField
                        fullWidth
                        label="Order ID"
                        margin="normal"
                        value={form.orderId}
                        error={Boolean(errors.orderId)}
                        helperText={errors.orderId}
                        onChange={handleChange('orderId')}
                    />

                    <TextField
                        fullWidth
                        select
                        label="Матеріал"
                        margin="normal"
                        value={form.materialId}
                        error={Boolean(errors.materialId)}
                        helperText={errors.materialId}
                        onChange={handleChange('materialId')}
                    >
                        <MenuItem value="">
                            Оберіть матеріал
                        </MenuItem>

                        {materials.map((material) => (
                            <MenuItem
                                key={material.id}
                                value={material.id}
                            >
                                {material.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="Кількість"
                        margin="normal"
                        type="number"
                        value={form.quantity}
                        error={Boolean(errors.quantity)}
                        helperText={errors.quantity}
                        onChange={handleChange('quantity')}
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
                            onClick={handleSave}
                        >
                            Зберегти
                        </Button>

                        <Button
                            disabled={isSaving}
                            onClick={handleCancel}
                        >
                            Скасувати
                        </Button>
                    </Box>
                </>
            )}

            <Snackbar
                open={Boolean(successMessage)}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
            >
                <Alert
                    severity="success"
                    onClose={() => setSuccessMessage('')}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default PurchaseRecordDetail;