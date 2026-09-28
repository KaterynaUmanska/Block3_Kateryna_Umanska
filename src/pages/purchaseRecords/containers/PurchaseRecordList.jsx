import React, { useCallback, useEffect, useState } from 'react';
import {
    useLocation,
    useNavigate,
} from 'react-router-dom';
import {
    Alert,
    Box,
    IconButton,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography as TypographyMui,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import Button from 'components/Button';
import Dialog from 'components/Dialog';
import TextField from 'components/TextField';
import pageURLs from 'constants/pagesURLs';
import {
    getPurchaseRecords,
    deletePurchaseRecord,
} from 'misc/requests/purchaseRecords';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;

const LIST_STATE_KEY = 'purchase-records-list-state';

const EMPTY_FILTERS = {
    orderId: '',
    materialName: '',
    quantityFrom: '',
    quantityTo: '',
};

function PurchaseRecordList() {
    const location = useLocation();
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [savedSearch, setSavedSearch] = useState(
        () => sessionStorage.getItem(LIST_STATE_KEY) || ''
    );

    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        record: null,
        error: '',
        isLoading: false,
    });

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const getInitialSearch = () => {
        if (location.search) return location.search;
        return sessionStorage.getItem(LIST_STATE_KEY) || '';
    };

    const initialParams = new URLSearchParams(getInitialSearch());

    const [page, setPage] = useState(
        Number(initialParams.get('page')) || DEFAULT_PAGE
    );
    const [size, setSize] = useState(
        Number(initialParams.get('size')) || DEFAULT_SIZE
    );

    const getFiltersFromParams = (params) => ({
        orderId: params.get('orderId') || '',
        materialName: params.get('materialName') || '',
        quantityFrom: params.get('quantityFrom') || '',
        quantityTo: params.get('quantityTo') || '',
    });

    const [filters, setFilters] = useState(() => getFiltersFromParams(initialParams));
    const [filterForm, setFilterForm] = useState(() => getFiltersFromParams(initialParams));

    useEffect(() => {
        const currentSavedSearch = sessionStorage.getItem(LIST_STATE_KEY) || '';
        setSavedSearch(currentSavedSearch);

        if (!location.search && currentSavedSearch) {
            navigate(
                `${pageURLs.purchaseRecords}${currentSavedSearch}`,
                { replace: true }
            );
        }
    }, [location.search, navigate]);

    useEffect(() => {
        const currentSearch = location.search || sessionStorage.getItem(LIST_STATE_KEY) || '';

        if (currentSearch) {
            sessionStorage.setItem(LIST_STATE_KEY, currentSearch);
            setSavedSearch(currentSearch);

            const params = new URLSearchParams(currentSearch);

            setPage(Number(params.get('page')) || DEFAULT_PAGE);
            setSize(Number(params.get('size')) || DEFAULT_SIZE);

            const nextFilters = getFiltersFromParams(params);
            setFilters(nextFilters);
            setFilterForm(nextFilters);
        }
    }, [location.search]);

    const loadRecords = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await getPurchaseRecords({
                orderId: filters.orderId
                    ? Number(filters.orderId)
                    : null,

                materialName: filters.materialName
                    ? filters.materialName
                    : null,

                quantityFrom: filters.quantityFrom
                    ? Number(filters.quantityFrom)
                    : null,

                quantityTo: filters.quantityTo
                    ? Number(filters.quantityTo)
                    : null,

                page,
                size,
            });

            setRecords(response.list || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            setNotification({
                open: true,
                message:
                    'Не вдалося завантажити записи про закупівлі.',
                severity: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }, [
        filters,
        page,
        size,
    ]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const updateUrl = (
        nextFilters,
        nextPage = 1,
        nextSize = size
    ) => {
        const params = new URLSearchParams();

        params.set('page', String(nextPage));
        params.set('size', String(nextSize));

        Object.entries(nextFilters).forEach(([key, value]) => {
            if (value !== '') {
                params.set(key, value);
            }
        });

        const search = `?${params.toString()}`;

        sessionStorage.setItem(
            LIST_STATE_KEY,
            search
        );
        setSavedSearch(search);

        navigate(
            `${pageURLs.purchaseRecords}${search}`
        );
    };

    const handleFilterSubmit = () => {
        updateUrl(filterForm, 1);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilterForm(EMPTY_FILTERS);
        updateUrl(EMPTY_FILTERS, 1);
        setShowFilters(false);
    };

    const handlePageChange = (nextPage) => {
        updateUrl(filters, nextPage);
    };

    const handleDelete = async () => {
        if (!deleteDialog.record) {
            return;
        }

        setDeleteDialog((state) => ({
            ...state,
            error: '',
            isLoading: true,
        }));

        try {
            await deletePurchaseRecord(
                deleteDialog.record.id
            );

            setDeleteDialog({
                open: false,
                record: null,
                error: '',
                isLoading: false,
            });

            if (records.length === 1 && page > 1) {
                const newPage = page - 1;

                setPage(newPage);

                const currentParams = new URLSearchParams(window.location.search);
                currentParams.set('page', String(newPage));

                window.history.replaceState(
                    null,
                    '',
                    `${window.location.pathname}?${currentParams.toString()}`
                );

                sessionStorage.setItem(
                    LIST_STATE_KEY,
                    currentParams.toString()
                );

                await loadRecords();
            } else {
                await loadRecords();
            }

            setNotification({
                open: true,
                message: 'Запис успішно видалено.',
                severity: 'success',
            });
        } catch (error) {
            setDeleteDialog((state) => ({
                ...state,
                error:
                    'Не вдалося видалити запис. Спробуйте ще раз.',
                isLoading: false,
            }));
        }
    };

    const handleCreate = () => {
        const currentSearch =
            location.search || savedSearch;

        sessionStorage.setItem(
            LIST_STATE_KEY,
            currentSearch
        );

        navigate(
            `${pageURLs.purchaseRecords}/new`,
            {
                state: {
                    listSearch: currentSearch,
                },
            }
        );
    };

    const handleOpenRecord = (id) => {
        const currentSearch =
            location.search || savedSearch;

        sessionStorage.setItem(
            LIST_STATE_KEY,
            currentSearch
        );

        navigate(
            `${pageURLs.purchaseRecords}/${id}`,
            {
                state: {
                    listSearch: currentSearch,
                },
            }
        );
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 3,
                }}
            >
                <TypographyMui variant="h5" sx={{ textAlign: 'center', flexGrow: 1 }} >
                    Записи про закупівлі
                </TypographyMui>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        startIcon={<FilterAltIcon />}
                        onClick={() =>
                            setShowFilters((value) => !value)
                        }
                    >
                        Фільтр
                    </Button>

                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                    >
                        Додати сутність
                    </Button>
                </Box>
            </Box>

            {showFilters && (
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns:
                            'repeat(4, 1fr)',
                        marginBottom: 3,
                    }}
                >
                    <TextField
                        label="ID Заявки"
                        value={filterForm.orderId}
                        onChange={(event) =>
                            setFilterForm({
                                ...filterForm,
                                orderId: event.target.value,
                            })
                        }
                    />

                    <TextField
                        label="Матеріал"
                        value={filterForm.materialName}
                        onChange={(event) =>
                            setFilterForm({
                                ...filterForm,
                                materialName:
                                event.target.value,
                            })
                        }
                    />

                    <TextField
                        label="Кількість від"
                        value={filterForm.quantityFrom}
                        onChange={(event) =>
                            setFilterForm({
                                ...filterForm,
                                quantityFrom:
                                event.target.value,
                            })
                        }
                    />

                    <TextField
                        label="Кількість до"
                        value={filterForm.quantityTo}
                        onChange={(event) =>
                            setFilterForm({
                                ...filterForm,
                                quantityTo:
                                event.target.value,
                            })
                        }
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                        }}
                    >
                        <Button
                            onClick={handleFilterSubmit}
                        >
                            Застосувати
                        </Button>

                        <Button
                            variant="text"
                            onClick={handleClearFilters}
                        >
                            Очистити
                        </Button>
                    </Box>
                </Box>
            )}

            <Box sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>
                                ID Заявки
                            </TableCell>
                            <TableCell>
                                Матеріал
                            </TableCell>
                            <TableCell>
                                Кількість
                            </TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {!isLoading &&
                            records.map((record) => (
                                <TableRow
                                    key={record.id}
                                    hover
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover .delete-button': {
                                            opacity: 1,
                                        },
                                    }}
                                    onClick={() =>
                                        handleOpenRecord(
                                            record.id
                                        )
                                    }
                                >
                                    <TableCell>
                                        {record.id}
                                    </TableCell>

                                    <TableCell>
                                        {record.orderId}
                                    </TableCell>

                                    <TableCell>
                                        {record.materialName}
                                    </TableCell>

                                    <TableCell>
                                        {record.quantity}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        sx={{
                                            width: 56,
                                        }}
                                    >
                                        <IconButton
                                            className="delete-button"
                                            aria-label="Видалити"
                                            onClick={() =>
                                                setDeleteDialog({
                                                    open: true,
                                                    record,
                                                    error: '',
                                                    isLoading: false,
                                                })
                                            }
                                            sx={{
                                                opacity: 0,
                                                transition: 'opacity 0.2s ease',
                                            }}
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}

                        {!isLoading &&
                            records.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        align="center"
                                    >
                                        Записів не знайдено.
                                    </TableCell>
                                </TableRow>
                            )}

                        {isLoading && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    align="center"
                                >
                                    Завантаження...
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Box>

            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'center',
                    marginTop: 3,
                }}
            >
                <Button
                    disabled={
                        page <= 1 || isLoading
                    }
                    onClick={() =>
                        handlePageChange(page - 1)
                    }
                >
                    Попередня
                </Button>

                <TypographyMui>
                    {page} / {totalPages}
                </TypographyMui>

                <Button
                    disabled={
                        page >= totalPages || isLoading
                    }
                    onClick={() =>
                        handlePageChange(page + 1)
                    }
                >
                    Наступна
                </Button>
            </Box>

            <Dialog
                open={deleteDialog.open}
                onClose={() => {
                    if (!deleteDialog.isLoading) {
                        setDeleteDialog({
                            open: false,
                            record: null,
                            error: '',
                            isLoading: false,
                        });
                    }
                }}
            >
                <Box sx={{ padding: 3 }}>
                    <TypographyMui variant="h6">
                        Видалення запису
                    </TypographyMui>

                    <TypographyMui
                        sx={{ marginTop: 2 }}
                    >
                        Ви впевнені, що хочете видалити
                        запис №{' '}
                        {deleteDialog.record?.id}?
                    </TypographyMui>

                    {deleteDialog.error && (
                        <Alert
                            severity="error"
                            sx={{ marginTop: 2 }}
                        >
                            {deleteDialog.error}
                        </Alert>
                    )}

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'flex-end',
                            marginTop: 3,
                        }}
                    >
                        <Button
                            disabled={
                                deleteDialog.isLoading
                            }
                            onClick={() =>
                                setDeleteDialog({
                                    open: false,
                                    record: null,
                                    error: '',
                                    isLoading: false,
                                })
                            }
                        >
                            Скасувати
                        </Button>

                        <Button
                            disabled={
                                deleteDialog.isLoading
                            }
                            isLoading={
                                deleteDialog.isLoading
                            }
                            onClick={handleDelete}
                        >
                            Видалити
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            <Snackbar
                autoHideDuration={3000}
                open={notification.open}
                onClose={() =>
                    setNotification({
                        ...notification,
                        open: false,
                    })
                }
            >
                <Alert
                    severity={notification.severity}
                    onClose={() =>
                        setNotification({
                            ...notification,
                            open: false,
                        })
                    }
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default PurchaseRecordList;