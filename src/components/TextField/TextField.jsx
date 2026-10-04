import React, { useState } from 'react';
import InputAdornmentMui from '@mui/material/InputAdornment';
import TextFieldMui from '@mui/material/TextField';
import Typography from '../Typography';
import useTheme from 'misc/hooks/useTheme';

const colorVariants = {
    header: 'header',
    primary: 'primary',
};

const inputTypes = {
    password: 'password',
    text: 'text',
};

const REQUIRED_CHAR = '*';

const TextField = ({
                       AdornmentStart,
                       AdornmentEnd,
                       autoFocus = false,
                       colorVariant = colorVariants.primary,
                       disabled = false,
                       helperText,
                       inputType = inputTypes.text,
                       isError = false,
                       label,
                       multiline = false,
                       onBlur,
                       onChange,
                       onSelect,
                       required = false,
                       value = '',
                       children,
                       ...props
                   }) => {
    const { theme } = useTheme();

    const [state, setState] = useState({
        isFocused: false,
    });

    const isEmptyValue =
        value === null ||
        value === undefined ||
        String(value).length === 0;

    const labelColor = isError
        ? theme.colors.text.error
        : '#000000';

    return (
        <TextFieldMui
            {...props}
            autoFocus={autoFocus}
            disabled={disabled}
            error={isError}
            helperText={helperText}
            fullWidth
            InputProps={{
                endAdornment: AdornmentEnd && (
                    <InputAdornmentMui position="end">
                        {AdornmentEnd}
                    </InputAdornmentMui>
                ),
                startAdornment: AdornmentStart && (
                    <InputAdornmentMui position="start">
                        {AdornmentStart}
                    </InputAdornmentMui>
                ),
            }}
            label={(
                <Typography color={labelColor}>
                    {required
                        ? `${REQUIRED_CHAR}${label}`
                        : label}
                </Typography>
            )}
            multiline={multiline}
            onBlur={(event) => {
                setState({
                    ...state,
                    isFocused: false,
                });

                onBlur?.(event);
            }}
            onChange={onChange}
            onFocus={() =>
                setState({
                    ...state,
                    isFocused: true,
                })
            }
            onSelect={onSelect}
            sx={{
                '& .MuiInputBase-root:before': {
                    display: 'none',
                },

                '& .MuiInputBase-root:after': {
                    display: 'none',
                },

                '& .MuiInputBase-root': {
                    background:
                        disabled &&
                        'rgba(0, 0, 0, 0.05) !important',

                    borderBottom: `1px solid ${
                        isError
                            ? theme.colors.text.error
                            : '#000000'
                    }`,

                    color: '#000000',

                    opacity: disabled ? 0.4 : 1,

                    marginTop:
                        `${theme.spacing(1.5)}px`,

                    '&:hover': !disabled
                        ? {
                            marginBottom:
                                '-0.5px !important',

                            borderBottom: `2px solid ${
                                isError
                                    ? theme.colors.text.error
                                    : '#000000'
                            }`,
                        }
                        : {},
                },

                '& .MuiFormHelperText-root': {
                    color: isError
                        ? theme.colors.text.error
                        : '#000000',
                },

                '& .MuiInputLabel-root': {
                    color: isError
                        ? theme.colors.text.error
                        : '#000000',
                },

                '& .MuiInputLabel-root.Mui-focused': {
                    color: isError
                        ? theme.colors.text.error
                        : '#000000',
                },

                ...props.sx,
            }}
            type={inputType}
            value={value}
            variant="standard"
        >
            {children}
        </TextFieldMui>
    );
};

export default TextField;