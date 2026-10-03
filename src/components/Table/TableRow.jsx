import React from 'react';
import TableRowMUI from '@mui/material/TableRow';

const TableRow = ({ children, ...props }) => (
    <TableRowMUI {...props}>
        {children}
    </TableRowMUI>
);

export default TableRow;