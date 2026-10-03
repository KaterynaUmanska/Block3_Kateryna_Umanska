import React from 'react';
import SnackbarMUI from '@mui/material/Snackbar';

const Snackbar = ({
                      children,
                      autoHideDuration = 3000,
                      open = false,
                      onClose,
                      ...props
                  }) => (
    <SnackbarMUI
        {...props}
        autoHideDuration={autoHideDuration}
        open={open}
        onClose={onClose}
    >
        {children}
    </SnackbarMUI>
);

export default Snackbar;