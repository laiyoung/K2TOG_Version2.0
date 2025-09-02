import React from 'react';
import { Select as MuiSelect } from '@mui/material';

// Custom Select component that automatically applies the correct z-index for admin dashboard
const Select = React.forwardRef(({ MenuProps, ...props }, ref) => {
    const defaultMenuProps = {
        sx: { zIndex: 1500 }
    };

    const mergedMenuProps = {
        ...defaultMenuProps,
        ...MenuProps,
        sx: {
            ...defaultMenuProps.sx,
            ...(MenuProps?.sx || {})
        }
    };

    return (
        <MuiSelect
            ref={ref}
            MenuProps={mergedMenuProps}
            {...props}
        />
    );
});

Select.displayName = 'Select';

export default Select;
