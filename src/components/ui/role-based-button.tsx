'use client'
import React from 'react';
import { Button, Tooltip } from 'antd';
import { useUser } from '@/contexts/UserContext';

interface RoleBasedButtonProps extends React.ComponentProps<typeof Button> {
  /**
   * The user role required to enable this button
   * If not provided, defaults to checking if user is not a 'viewer'
   */
  requiredRole?: string;
  /**
   * Tooltip message to show when button is disabled due to insufficient permissions
   */
  disabledTooltip?: string;
  /**
   * Whether to show tooltip only on hover or always when disabled
   */
  showTooltipOnHover?: boolean;
}

const RoleBasedButton = React.forwardRef<HTMLButtonElement, RoleBasedButtonProps>(
  ({ 
    requiredRole, 
    disabledTooltip = "No permission to perform this action", 
    showTooltipOnHover = true,
    disabled,
    ...props 
  }, ref) => {
    const { currentUserDetails, userLoading } = useUser();
    const userRole = currentUserDetails?.role;
    const isLoading = userLoading;

    // Determine if button should be disabled
    const isDisabled = disabled || isLoading || (userRole === 'viewer' || (requiredRole && userRole !== requiredRole));
    
    // Determine if tooltip should be shown
    const shouldShowTooltip = isDisabled && !disabled && !isLoading && userRole === 'viewer';

    const buttonElement = (
      <Button
        ref={ref}
        disabled={isDisabled || disabled}
        {...props}
      />
    );

    if (shouldShowTooltip) {
      return (
        <Tooltip
          title={disabledTooltip}
          placement="top"
        >
          <span>
            {buttonElement}
          </span>
        </Tooltip>
      );
    }

    return buttonElement;
  }
);

RoleBasedButton.displayName = 'RoleBasedButton';

export { RoleBasedButton };
export type { RoleBasedButtonProps };
