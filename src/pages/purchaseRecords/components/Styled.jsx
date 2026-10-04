import React from 'react';

import Box from 'components/Box';
import Alert from 'components/Alert';
import TableRow from 'components/Table/TableRow';
import TableCell from 'components/Table/TableCell';
import Typography from 'components/Typography';

const BOX_STYLES = {
    listRoot: { width: '100%' },
    listHeader: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    listHeaderActions: {
        display: 'flex',
        gap: 1,
    },
    listFilters: {
        display: 'grid',
        gap: 2,
        gridTemplateColumns: 'repeat(4, 1fr)',
        marginBottom: 3,
    },
    inlineActions: {
        display: 'flex',
        gap: 1,
    },
    listTable: { width: '100%' },
    pagination: {
        alignItems: 'center',
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        marginTop: 3,
    },
    dialogContent: { padding: 3 },
    dialogText: { marginTop: 2 },
    dialogActions: {
        display: 'flex',
        gap: 1,
        justifyContent: 'flex-end',
        marginTop: 3,
    },
    detailRoot: { maxWidth: 700 },
    detailTitle: {
        marginBottom: 2,
        textAlign: 'center',
    },
    detailEditActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 2,
    },
    detailFields: { paddingLeft: 4 },
    detailBack: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 3,
    },
    detailFormActions: {
        display: 'flex',
        gap: 1,
        marginTop: 3,
    },
    errorBack: { marginTop: 2 },
};

export const PurchaseRecordBox = ({ variant, children, ...props }) => (
    <Box {...props} sx={BOX_STYLES[variant]}>
        {children}
    </Box>
);

export const PurchaseRecordTitle = ({ children, ...props }) => (
    <Typography {...props} variant="title" sx={{ flexGrow: 1 }}>
        {children}
    </Typography>
);

export const PurchaseRecordField = ({ children, emphasized = false, last = false }) => (
    <Typography sx={{ marginBottom: last ? 3 : 2, ...(emphasized ? { fontSize: '18px' } : {}) }}>
        {children}
    </Typography>
);

export const PurchaseRecordAlert = ({ variant = 'default', children, ...props }) => {
    const styles = {
        errorWithMargin: { marginBottom: 2 },
        deleteError: { marginTop: 2 },
        default: undefined,
    };

    return (
        <Alert {...props} sx={styles[variant]}>
            {children}
        </Alert>
    );
};

export const PurchaseRecordRow = ({ variant = 'normal', children, ...props }) => {
    const styles = variant === 'record'
        ? {
            cursor: 'pointer',
            '& .delete-button': {
                opacity: 0,
                visibility: 'hidden',
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease',
            },
            '&:hover .delete-button': {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
            },
        }
        : undefined;

    return (
        <TableRow {...props} sx={styles}>
            {children}
        </TableRow>
    );
};

export const PurchaseRecordActionCell = ({ children, ...props }) => (
    <TableCell {...props} align="right" sx={{ width: 56 }}>
        {children}
    </TableCell>
);


