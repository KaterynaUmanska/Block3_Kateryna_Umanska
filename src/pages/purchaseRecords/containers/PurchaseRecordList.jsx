import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

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

import {
    PurchaseRecordBox,
    PurchaseRecordTitle,
    PurchaseRecordRow,
    PurchaseRecordActionCell,
    PurchaseRecordAlert,
} from '../components/Styled';

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

const EMPTY_FILTERS = {
    orderId: '',
    materialName: '',
    quantityFrom: '',
    quantityTo: '',
};

const getFiltersFromParams = (params) => ({
    orderId: params.get('orderId') || '',
    materialName: params.get('materialName') || '',
    quantityFrom: params.get('quantityFrom') || '',
    quantityTo: params.get('quantityTo') || '',
});

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

    const initialParams = new URLSearchParams(
        location.search
    );

    const [page, setPage] = useState(
        Number(initialParams.get('page')) || DEFAULT_PAGE
    );

    const [size, setSize] = useState(
        Number(initialParams.get('size')) || DEFAULT_SIZE
    );

    const [filters, setFilters] = useState(
        () => getFiltersFromParams(initialParams)
    );

    const [filterForm, setFilterForm] = useState(
        () => getFiltersFromParams(initialParams)
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

    useEffect(() => {
        const params = new URLSearchParams(
            location.search
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
    }, [location.search]);

    const loadRecords = useCallback(
        (pageToLoad = page) => {
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
        },
        [
            dispatch,
            filters,
            page,
            size,
            formatMessage,
        ]
    );

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

        const search =
            `?${params.toString()}`;

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
                        location.search
                    );

                currentParams.set(
                    'page',
                    String(newPage)
                );

                const newSearch =
                    `?${currentParams.toString()}`;

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
            location.search;

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
        location.search;

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
    <PurchaseRecordBox variant="listRoot">
        <PurchaseRecordBox variant="listHeader">
            <PurchaseRecordTitle align="center">
                {formatMessage({
                    id: 'purchaseRecords.title',
                })}
            </PurchaseRecordTitle>

            <PurchaseRecordBox variant="listHeaderActions">
                <Button
                    startIcon={
                        <FilterAltIcon />
                    }
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
                    startIcon={
                        <AddIcon />
                    }
                    onClick={handleCreate}
                >
                    {formatMessage({
                        id: 'purchaseRecords.add',
                    })}
                </Button>
            </PurchaseRecordBox>
        </PurchaseRecordBox>

        {showFilters && (
            <PurchaseRecordBox variant="listFilters">
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

                <PurchaseRecordBox variant="filterActions">
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
                </PurchaseRecordBox>
            </PurchaseRecordBox>
        )}

        <PurchaseRecordBox variant="listTable">
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
                        records.map(
                            (record) => (
                                <PurchaseRecordRow
                                    variant="record"
                                    key={record.id}
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
                                        {
                                            record.materialName
                                        }
                                    </TableCell>

                                    <TableCell>
                                        {
                                            record.quantity
                                        }
                                    </TableCell>

                                    <PurchaseRecordActionCell
                                        onClick={(
                                            event
                                        ) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <IconButton
                                            className="delete-button"
                                            aria-label={formatMessage(
                                                {
                                                    id: 'purchaseRecords.delete.confirmButton',
                                                }
                                            )}
                                            onClick={() => {
                                                setDeleteDialog(
                                                    {
                                                        open: true,
                                                        record,
                                                        error: '',
                                                        isLoading: false,
                                                    }
                                                );
                                            }}
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </PurchaseRecordActionCell>
                                </PurchaseRecordRow>
                            )
                        )}

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
        </PurchaseRecordBox>

        <PurchaseRecordBox variant="pagination">
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
        </PurchaseRecordBox>

        <Dialog
            open={deleteDialog.open}
            onClose={() => {
                if (
                    !deleteDialog.isLoading
                ) {
                    setDeleteDialog({
                        open: false,
                        record: null,
                        error: '',
                        isLoading: false,
                    });
                }
            }}
        >
            <PurchaseRecordBox variant="dialogContent">
                <Typography variant="h6">
                    {formatMessage({
                        id: 'purchaseRecords.delete.title',
                    })}
                </Typography>

                <PurchaseRecordBox variant="dialogText">
                    {formatMessage(
                        {
                            id: 'purchaseRecords.delete.confirm',
                        },
                        {
                            id: deleteDialog
                                .record?.id,
                        }
                    )}
                </PurchaseRecordBox>

                {deleteDialog.error && (
                    <PurchaseRecordAlert
                        variant="deleteError"
                        severity="error"
                    >
                        {
                            deleteDialog.error
                        }
                    </PurchaseRecordAlert>
                )}

                <PurchaseRecordBox variant="dialogActions">
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
                </PurchaseRecordBox>
            </PurchaseRecordBox>
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
                severity={
                    notification.severity
                }
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
    </PurchaseRecordBox>
);
}

export default PurchaseRecordList;
