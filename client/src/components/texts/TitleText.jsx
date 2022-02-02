import React from "react";
import { Typography } from "@mui/material";

const TitleStyle = {
  fontWeight: "500",
  fontSize: "24px",
  color: "#0FB8C3",
  textAlign: "center",
  whiteSpace: "break-spaces",
};

const TitleText = ({ title, variant = "normal" }) => {
  return (
    <Typography
      variant="h6"
      sx={variant === "big" ? { ...TitleStyle, fontSize: "34px" } : TitleStyle}
    >
      {title}
    </Typography>
  );
};

export default TitleText;
