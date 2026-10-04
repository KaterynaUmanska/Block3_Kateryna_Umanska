import React from 'react';
import IconButtonMUI from '@mui/material/IconButton';
import useTheme from 'misc/hooks/useTheme';

const colorVariants = {
    header: 'header',
    primary: 'primary',
    secondary: 'secondary',
};

const IconButton = React.forwardRef(({
                                         children,
                                         colorVariant = colorVariants.secondary,
                                         disabled = false,
                                         disableHoverSpace = false,
                                         onClick,
                                         onPress,
                                         onRelease,
                                         className,
                                         sx,
                                         ...props
                                     }, ref) => {
    const { theme } = useTheme();

    return (
        <IconButtonMUI
            {...props}
            ref={ref}
            disabled={disabled}
            onClick={onClick}
            onMouseDown={onPress}
            onMouseUp={onRelease}
            className={className}
            sx={{
                '&.MuiIconButton-root': {
                    '&.Mui-disabled': {
                        background:
                        theme.button.color[colorVariant].backgroundDisabled,
                    },

                    '&:hover': {
                        background:
                        theme.button.color[colorVariant].backgroundHovered,
                    },

                    background:
                    theme.button.color[colorVariant].background,

                    color: '#000000',

                    padding:
                        `${theme.spacing(0.5)}px`,

                    ...(disabled && {
                        opacity: 0.4,
                    }),
                },

                ...sx,
            }}
        >
            {children}
        </IconButtonMUI>
    );
});

IconButton.displayName = 'IconButton';

export default IconButton;