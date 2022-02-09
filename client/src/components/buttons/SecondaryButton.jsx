import { Button } from "@mui/material";
import React from "react";

const ButtonStyle = {
  height: "100%",
  width: "141px",
  border: "1px solid #0FB8C3",
  color: "#0FB8C3",
  fontSize: "14px",
};

const SecondaryButton = ({ text, onClick }) => {
  return (
    <Button sx={ButtonStyle} onClick={onClick}>
      {text}
    </Button>
  );
};

export default SecondaryButton;
