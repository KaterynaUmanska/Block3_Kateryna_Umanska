import React from 'react';
import TableMUI from '@mui/material/Table';

const Table = ({ children, ...props }) => (
    <TableMUI {...props}>
        {children}
    </TableMUI>
);

export default Table;