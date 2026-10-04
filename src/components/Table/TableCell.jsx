import React from 'react';
import TableCellMUI from '@mui/material/TableCell';

const TableCell = ({ children, ...props }) => (
    <TableCellMUI {...props}>
        {children}
    </TableCellMUI>
);

export default TableCell;