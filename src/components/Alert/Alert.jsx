import React from 'react';
import AlertMUI from '@mui/material/Alert';

const Alert = React.forwardRef(({
                                    children,
                                    severity = 'info',
                                    onClose,
                                    sx,
                                    ...props
                                }, ref) => (
    <AlertMUI
        {...props}
        ref={ref}
        severity={severity}
        onClose={onClose}
        sx={sx}
    >
        {children}
    </AlertMUI>
));

Alert.displayName = 'Alert';

export default Alert;