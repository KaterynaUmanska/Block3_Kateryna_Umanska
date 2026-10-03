import React from 'react';
import TooltipMUI from '@mui/material/Tooltip';

const Tooltip = ({ children, ...props }) => (
    <TooltipMUI {...props}>
        {children}
    </TooltipMUI>
);

export default Tooltip;