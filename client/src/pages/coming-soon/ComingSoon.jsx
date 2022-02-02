import React from "react";
import { Box } from "@mui/material";
import TitleText from "../../components/texts/TitleText";

const BoxStyle = {
  width: "100%",
  height: "auto",
  minHeight: "inherit",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const ComingSoon = () => {
  return (
    <Box sx={BoxStyle}>
      <TitleText title="Coming Soon!" variant="big" />
    </Box>
  );
};

export default ComingSoon;
