import { Button } from "@mui/material";
import React from "react";

const BtnStyle = {
  borderRadius: "4px",
  backgroundColor: "#0FC391",
  lineHeight: "16px",
  fontSize: "16px",
  paddingTop: "17px",
  paddingBottom: "17px",
  maxHeight: "50px",
  height: "100%",
  maxWidth: "250px",
  width: "100%",
  "&:hover": {
    backgroundColor: "#0FC391",
  },
};

const CreateButton = ({ text, onClick, disabled }) => {
  return (
    <Button
      variant="contained"
      sx={BtnStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </Button>
  );
};

export default CreateButton;
