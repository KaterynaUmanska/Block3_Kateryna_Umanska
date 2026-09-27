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

function PurchaseRecordDetail() {
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
                    setRequestError('Запис не знайдено');
                    return;
                }

                const recordResponse = await getPurchaseRecord(id);

                setRecord(recordResponse);

                setForm({
                    orderId: recordResponse.orderId,
                    materialId: recordResponse.material?.id || '',
                    quantity: recordResponse.quantity,
                });

                setMode('view');

            } catch (error) {
                console.error(
                    'LOAD DETAIL ERROR:',
                    error
                );

                setRequestError(
                    'Не вдалося завантажити запис про закупівлю.'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, isCreateMode]);

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);

            navigate(location.pathname, {
                replace: true,
                state: {
                    listSearch:
                        location.state?.listSearch || '',
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
        } else if (
            !/^\d+$/.test(String(form.orderId)) ||
            Number(form.orderId) <= 0
        ) {
            validationErrors.orderId =
                'Order ID має містити лише цифри та бути більше 0.';
        }

        if (!form.materialId) {
            validationErrors.materialId =
                'Матеріал є обов’язковим.';
        }

        if (!form.quantity) {
            validationErrors.quantity =
                'Кількість є обов’язковою.';
        } else if (
            !/^\d+([.,]\d+)?$/.test(String(form.quantity)) ||
            Number(
                String(form.quantity).replace(',', '.')
            ) <= 0
        ) {
            validationErrors.quantity =
                'Кількість має бути числом більше 0.';
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
            materialId: record.material?.id || '',
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

        const data = {
            orderId: Number(form.orderId),
            materialId: Number(form.materialId),
            quantity: Number(
                String(form.quantity).replace(',', '.')
            ),
        };

        try {
            const createdRecord =
                await createPurchaseRecord(data);

            navigate(`${pageURLs.purchaseRecords}/${createdRecord.id}`,
                {
                    replace: true,
                    state: {
                        listSearch: location.state?.listSearch || '', successMessage: 'Запис успішно створено.',},
                });

        }catch (error) {
            console.error('CREATE ERROR:', error);

            if (error?.status === 409) {
                setRequestError(
                    'Даний матеріал вже входить до даної закупівлі.'
                );
                return;
            }

            setRequestError(
                'Не вдалося створити запис. Перевірте введені дані.'
            );
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

        const data = {
            orderId: Number(form.orderId),
            materialId: Number(form.materialId),
            quantity: Number(
                String(form.quantity).replace(',', '.')
            ),
        };

        try {
            await updatePurchaseRecord(id, data);

            const updatedRecord =
                await getPurchaseRecord(id);

            setRecord(updatedRecord);

            setForm({
                orderId: updatedRecord.orderId,
                materialId:
                    updatedRecord.material?.id || '',
                quantity: updatedRecord.quantity,
            });

            setMode('view');

            setSuccessMessage(
                'Запис успішно відредаговано.'
            );
        } catch (error) {
            console.error('CREATE ERROR:', error);

            if (error?.status === 409) {
                setRequestError(
                    'Даний матеріал вже входить до даної закупівлі.'
                );
                return;
            }

            setRequestError(
                'Не вдалося створити запис. Перевірте введені дані.'
            );
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
                    Назад
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
                    ? 'Створення запису'
                    : mode === 'edit'
                        ? 'Редагування запису'
                        : 'Детальна інформація про запис'}
            </Typography>
        </Box>

        {mode === 'view' && (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 2,
                }}
            >
                <Tooltip title="Редагувати">
                    <IconButton
                        onClick={handleEdit}
                        aria-label="Редагувати"
                    >
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        )}

        {requestError && (
            <Alert
                severity="error"
                sx={{ marginBottom: 2 }}
            >
                {requestError}
            </Alert>
        )}

        {mode === 'view' && (
            <Box sx={{ pl: 4 }}>
                <Typography sx={{ marginBottom: 2 }}>
                    <strong>ID:</strong> {record.id}
                </Typography>

                <Typography sx={{ marginBottom: 2 }}>
                    <strong>Order ID:</strong>{' '}
                    {record.orderId}
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
                        alignItems: 'center',
                        marginTop: 3,
                    }}
                >
                    <Button onClick={handleBack}>
                        Назад
                    </Button>
                </Box>
            </Box>
        )}

        {(mode === 'edit' || mode === 'create') && (
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
                        onClick={
                            mode === 'create'
                                ? handleCreate
                                : handleSave
                        }
                    >
                        {mode === 'create'
                            ? 'Створити'
                            : 'Зберегти'}
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
