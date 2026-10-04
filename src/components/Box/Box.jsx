import React from 'react';
import BoxMUI from '@mui/material/Box';

const Box = ({
                 children,
                 sx,
                 ...props
             }) => (
    <BoxMUI
        {...props}
        sx={sx}
    >
        {children}
    </BoxMUI>
);

export default Box;