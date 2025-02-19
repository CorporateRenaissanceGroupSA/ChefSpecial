import React from "react";
import { Button, ButtonProps, SxProps, Theme } from "@mui/material";

interface CustomButtonProps {
  color?: ButtonProps["color"];
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  sx?: SxProps<Theme>;
  children: string | JSX.Element;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  color,
  onClick,
  sx,
  variant,
  size,
  children,
}) => {
  return (
    <Button
      color={color}
      variant={variant}
      size={size}
      onClick={onClick}
      sx={sx}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
