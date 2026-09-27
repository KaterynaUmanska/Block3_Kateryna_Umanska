import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from 'components/Button';
import pageURLs from 'constants/pagesURLs';
import {
    createPurchaseRecord,
    getMaterials,
} from 'misc/requests/purchaseRecords';

const emptyForm = {
    orderId: '',
    materialId: '',
    quantity: '',
};

function PurchaseRecordCreate() {
    const location = useLocation();
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [materials, setMaterials] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        const loadMaterials = async () => {
            try {
                setIsLoading(true);
                setRequestError('');

                const response = await getMaterials();

                setMaterials(response || []);
            } catch (error) {
                setRequestError(
                    'Не вдалося завантажити список матеріалів.'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadMaterials();
    }, []);

    const handleChange = (field) => (event) => {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: event.target.value,
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            [field]: '',
        }));
    };

    const validate = () => {
        const validationErrors = {};

        if (!form.orderId) {
            validationErrors.orderId = 'Order ID є обов’язковим.';
        } else if (Number(form.orderId) <= 0) {
            validationErrors.orderId = 'Order ID має бути більше 0.';
        }

        if (!form.materialId) {
            validationErrors.materialId = 'Матеріал є обов’язковим.';
        }

        if (!form.quantity) {
            validationErrors.quantity = 'Кількість є обов’язковою.';
        } else if (Number(form.quantity) <= 0) {
            validationErrors.quantity = 'Кількість має бути більше 0.';
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
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
            quantity: Number(form.quantity),
        };

        try {
            const response = await createPurchaseRecord(data);

            const createdRecordId = response?.id || response?.data?.id;

            navigate(
                `${pageURLs.purchaseRecords}/${createdRecordId}`,
                {
                    state: {
                        listSearch: location.state?.listSearch || '',
                        successMessage: 'Запис успішно створено.',
                    },
                }
            );
        } catch (error) {
            console.log('CATCH ERROR:', error);

            const status = error?.response?.status || error?.status;

            if (status === 409) {
                setRequestError(
                    'Даний матеріал вже входить до даної закупівлі.'
                );
            } else {
                setRequestError(
                    'Не вдалося створити запис. Перевірте введені дані.'
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate({
            pathname: pageURLs.purchaseRecords,
            search: location.state?.listSearch || '',
        });
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ maxWidth: 600 }}>
            <Typography
                variant="h5"
                sx={{ marginBottom: 3 }}
            >
                Створення запису про закупівлю
            </Typography>

            {requestError && (
                <Alert
                    severity="error"
                    sx={{ marginBottom: 2 }}
                >
                    {requestError}
                </Alert>
            )}

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
                    onClick={handleCreate}
                >
                    Створити
                </Button>

                <Button
                    disabled={isSaving}
                    onClick={handleCancel}
                >
                    Скасувати
                </Button>
            </Box>
        </Box>
    );
}

export default PurchaseRecordCreate;