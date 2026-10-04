import React, { useCallback, useEffect, useState } from 'react';
import {
    useLocation,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Box from 'components/Box';
import Alert from 'components/Alert';
import IconButton from 'components/IconButton';
import Snackbar from 'components/Snackbar';
import Button from 'components/Button';
import Dialog from 'components/Dialog';
import TextField from 'components/TextField';
import Table, {
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from 'components/Table';
import Typography from 'components/Typography';

import DeleteOutlineIcon from 'components/icons/Delete';
import AddIcon from 'components/icons/Add';
import FilterAltIcon from 'components/icons/FilterAlt';

import pageURLs from 'constants/pagesURLs';
import {
    fetchPurchaseRecords,
    deletePurchaseRecord,
} from 'app/actions/purchaseRecords';

import useLanguageNavigate from 'misc/hooks/useLanguageNavigate';

import { useIntl } from 'react-intl';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 8;

const LIST_STATE_KEY = 'purchase-records-list-state';

const EMPTY_FILTERS = {
    orderId: '',
    materialName: '',
    quantityFrom: '',
    quantityTo: '',
};

function PurchaseRecordList() {
    const { formatMessage } = useIntl();
    const dispatch = useDispatch();

    const {
        records,
        totalPages,
        isLoading,
    } = useSelector(
        (state) => state.purchaseRecords
    );

    const location = useLocation();
    const navigate = useLanguageNavigate();

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
        if (location.search) {
            return location.search;
        }

        return sessionStorage.getItem(LIST_STATE_KEY) || '';
    };

    const initialParams = new URLSearchParams(
        getInitialSearch()
    );

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

    const [filters, setFilters] = useState(
        () => getFiltersFromParams(initialParams)
    );

    const [filterForm, setFilterForm] = useState(
        () => getFiltersFromParams(initialParams)
    );

    useEffect(() => {
        const currentSavedSearch =
            sessionStorage.getItem(LIST_STATE_KEY) || '';

        setSavedSearch(currentSavedSearch);

        if (!location.search && currentSavedSearch) {
            navigate(
                `${pageURLs.purchaseRecords}${currentSavedSearch}`,
                { replace: true }
            );
        }
    }, [location.search, navigate]);

    useEffect(() => {
        const currentSearch =
            location.search ||
            sessionStorage.getItem(LIST_STATE_KEY) ||
            '';

        if (currentSearch) {
            sessionStorage.setItem(
                LIST_STATE_KEY,
                currentSearch
            );

            setSavedSearch(currentSearch);

            const params = new URLSearchParams(
                currentSearch
            );

            setPage(
                Number(params.get('page')) || DEFAULT_PAGE
            );

            setSize(
                Number(params.get('size')) || DEFAULT_SIZE
            );

            const nextFilters =
                getFiltersFromParams(params);

            setFilters(nextFilters);
            setFilterForm(nextFilters);
        }
    }, [location.search]);

    const loadRecords = useCallback((pageToLoad = page) => {
        return dispatch(
            fetchPurchaseRecords({
                orderId: filters.orderId,
                materialName: filters.materialName,
                quantityFrom: filters.quantityFrom,
                quantityTo: filters.quantityTo,
                page: pageToLoad,
                size,
            })
        ).catch(() => {
            setNotification({
                open: true,
                message: formatMessage({
                    id: 'purchaseRecords.error.loadList',
                }),
                severity: 'error',
            });
        });
    }, [
        dispatch,
        filters,
        page,
        size,
        formatMessage,
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

        params.set(
            'page',
            String(nextPage)
        );

        params.set(
            'size',
            String(nextSize)
        );

        Object.entries(nextFilters).forEach(
            ([key, value]) => {
                if (value !== '') {
                    params.set(key, value);
                }
            }
        );

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
        updateUrl(
            filterForm,
            1
        );

        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilterForm(EMPTY_FILTERS);

        updateUrl(
            EMPTY_FILTERS,
            1
        );

        setShowFilters(false);
    };

    const handlePageChange = (nextPage) => {
        updateUrl(
            filters,
            nextPage
        );
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
            await dispatch(
                deletePurchaseRecord(
                    deleteDialog.record.id
                )
            );

            setDeleteDialog({
                open: false,
                record: null,
                error: '',
                isLoading: false,
            });

            if (
                records.length === 1 &&
                page > 1
            ) {
                const newPage = page - 1;

                const currentParams =
                    new URLSearchParams(
                        window.location.search
                    );

                currentParams.set(
                    'page',
                    String(newPage)
                );

                const newSearch =
                    `?${currentParams.toString()}`;

                sessionStorage.setItem(
                    LIST_STATE_KEY,
                    newSearch
                );

                setSavedSearch(newSearch);
                setPage(newPage);

                navigate(
                    `${pageURLs.purchaseRecords}${newSearch}`,
                    { replace: true }
                );

                await loadRecords(newPage);
            } else {
                await loadRecords(page);
            }

            setNotification({
                open: true,
                message: formatMessage({
                    id: 'purchaseRecords.success.deleted',
                }),
                severity: 'success',
            });
        } catch (error) {
            setDeleteDialog((state) => ({
                ...state,
                error: formatMessage({
                    id: 'purchaseRecords.error.delete',
                }),
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
                <Typography
                    align="center"
                    variant="title"
                    sx={{ flexGrow: 1 }}
                >
                    {formatMessage({
                        id: 'purchaseRecords.title',
                    })}
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                    }}
                >
                    <Button
                        startIcon={<FilterAltIcon />}
                        onClick={() =>
                            setShowFilters(
                                (value) => !value
                            )
                        }
                    >
                        {formatMessage({
                            id: 'purchaseRecords.filter',
                        })}
                    </Button>

                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                    >
                        {formatMessage({
                            id: 'purchaseRecords.add',
                        })}
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
                        label={formatMessage({
                            id: 'purchaseRecords.orderId',
                        })}
                        value={filterForm.orderId}
                        onChange={(event) =>
                            setFilterForm({
                                ...filterForm,
                                orderId:
                                event.target.value,
                            })
                        }
                    />

                    <TextField
                        label={formatMessage({
                            id: 'purchaseRecords.materialName',
                        })}
                        value={
                            filterForm.materialName
                        }
                        onChange={(event) =>
                            setFilterForm({
                                ...filterForm,
                                materialName:
                                event.target.value,
                            })
                        }
                    />

                    <TextField
                        label={formatMessage({
                            id: 'purchaseRecords.quantityFrom',
                        })}
                        type="number"
                        value={
                            filterForm.quantityFrom
                        }
                        onChange={(event) =>
                            setFilterForm({
                                ...filterForm,
                                quantityFrom:
                                event.target.value,
                            })
                        }
                    />

                    <TextField
                        label={formatMessage({
                            id: 'purchaseRecords.quantityTo',
                        })}
                        type="number"
                        value={
                            filterForm.quantityTo
                        }
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
                            onClick={
                                handleFilterSubmit
                            }
                        >
                            {formatMessage({
                                id: 'purchaseRecords.apply',
                            })}
                        </Button>

                        <Button
                            onClick={
                                handleClearFilters
                            }
                        >
                            {formatMessage({
                                id: 'purchaseRecords.clear',
                            })}
                        </Button>
                    </Box>
                </Box>
            )}

            <Box sx={{ width: '100%' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {formatMessage({
                                    id: 'purchaseRecords.id',
                                })}
                            </TableCell>

                            <TableCell>
                                {formatMessage({
                                    id: 'purchaseRecords.orderId',
                                })}
                            </TableCell>

                            <TableCell>
                                {formatMessage({
                                    id: 'purchaseRecords.materialName',
                                })}
                            </TableCell>

                            <TableCell>
                                {formatMessage({
                                    id: 'purchaseRecords.quantity',
                                })}
                            </TableCell>

                            <TableCell />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {!isLoading &&
                            records.map((record) => (
                                <TableRow
                                    key={record.id}
                                    sx={{
                                        cursor: 'pointer',

                                        '& .delete-button': {
                                            opacity: 0,
                                            visibility: 'hidden',
                                            pointerEvents: 'none',
                                            transition:
                                                'opacity 0.2s ease',
                                        },

                                        '&:hover .delete-button': {
                                            opacity: 1,
                                            visibility: 'visible',
                                            pointerEvents: 'auto',
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
                                            aria-label={formatMessage({
                                                id: 'purchaseRecords.delete.confirmButton',
                                            })}
                                            onClick={() => {
                                                setDeleteDialog({
                                                    open: true,
                                                    record,
                                                    error: '',
                                                    isLoading: false,
                                                });
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
                                        {formatMessage({
                                            id: 'purchaseRecords.noRecords',
                                        })}
                                    </TableCell>
                                </TableRow>
                            )}

                        {isLoading && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    align="center"
                                >
                                    {formatMessage({
                                        id: 'purchaseRecords.loading',
                                    })}
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
                        page <= 1 ||
                        isLoading
                    }
                    onClick={() =>
                        handlePageChange(
                            page - 1
                        )
                    }
                >
                    {formatMessage({
                        id: 'purchaseRecords.previous',
                    })}
                </Button>

                <Typography>
                    {page} / {totalPages}
                </Typography>

                <Button
                    disabled={
                        page >= totalPages ||
                        isLoading
                    }
                    onClick={() =>
                        handlePageChange(
                            page + 1
                        )
                    }
                >
                    {formatMessage({
                        id: 'purchaseRecords.next',
                    })}
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
                    <Typography variant="h6">
                        {formatMessage({
                            id: 'purchaseRecords.delete.title',
                        })}
                    </Typography>

                    <Typography
                        sx={{
                            marginTop: 2,
                        }}
                    >
                        {formatMessage(
                            {
                                id: 'purchaseRecords.delete.confirm',
                            },
                            {
                                id: deleteDialog
                                    .record?.id,
                            }
                        )}
                    </Typography>

                    {deleteDialog.error && (
                        <Alert
                            severity="error"
                            sx={{
                                marginTop: 2,
                            }}
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
                            {formatMessage({
                                id: 'purchaseRecords.cancel',
                            })}
                        </Button>

                        <Button
                            disabled={
                                deleteDialog.isLoading
                            }
                            isLoading={
                                deleteDialog.isLoading
                            }
                            onClick={
                                handleDelete
                            }
                        >
                            {formatMessage({
                                id: 'purchaseRecords.delete.confirmButton',
                            })}
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
