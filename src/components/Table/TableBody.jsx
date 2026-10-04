import React from 'react';
import TableBodyMUI from '@mui/material/TableBody';

const TableBody = ({ children, ...props }) => (
    <TableBodyMUI {...props}>
        {children}
    </TableBodyMUI>
);

export default TableBody;