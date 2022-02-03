import { Typography } from "@mui/material";
import React, { useMemo } from "react";

const TypographyStyle = {
  fontWeight: "400",
  fontSize: "20px",
  textAlign: "center",
  color: "#676767",
  lineHeight: "27px",
};

const RegularText = ({ content, bold = false, variant = "normal" }) => {
  const styles = useMemo(() => {
    const additionalStyles = {};
    if (bold) {
      additionalStyles.fontWeight = 700;
    }

    if (variant === "small") {
      additionalStyles.fontWeight = 500;
      additionalStyles.fontSize = "14px";
    }
    return additionalStyles;
  }, [bold, variant]);
  return (
    <Typography variant="subtitle1" sx={{ ...TypographyStyle, ...styles }}>
      {content}
    </Typography>
  );
};

export default RegularText;
