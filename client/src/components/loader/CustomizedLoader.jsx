import React from "react";
import Box from "@mui/material/Box";
import { LinearProgress, CircularProgress } from "@mui/material";

const CustomizedLoader = ({
  type = "linear",
  color = "#14D9C1",
  size = "normal",
}) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", color }}>
      {type === "circle" ? (
        <CircularProgress
          color="inherit"
          size={size === "small" ? "20px" : "40px"}
        />
      ) : (
        <LinearProgress color="inherit" />
      )}
    </Box>
  );
};

export default CustomizedLoader;
