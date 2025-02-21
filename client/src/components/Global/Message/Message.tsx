import React, { CSSProperties } from "react";
import { Box } from "@mui/material";

interface MessageProps {
  img: string;
  alt: string;
  title: string;
  subtitle?: string;
  style?: CSSProperties;
  imgWidth: string;
  titleFontWeight: string;
}

const Message: React.FC<MessageProps> = ({
  img,
  alt,
  title,
  subtitle,
  style,
  imgWidth,
  titleFontWeight,
}) => {
  return (
    <Box
      style={style}
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        justifySelf: "center",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={img} alt={alt} style={{ width: imgWidth, height: "auto" }} />
      <p
        style={{
          fontSize: "18px",
          fontWeight: titleFontWeight,
          marginTop: "20px",
        }}
      >
        {title}
      </p>
      <p style={{ fontSize: "16px" }}>{subtitle}</p>
    </Box>
  );
};

export default Message;
