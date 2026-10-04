import React from 'react';
import TableHeadMUI from '@mui/material/TableHead';

const TableHead = ({ children, ...props }) => (
    <TableHeadMUI {...props}>
        {children}
    </TableHeadMUI>
);

export default TableHead;