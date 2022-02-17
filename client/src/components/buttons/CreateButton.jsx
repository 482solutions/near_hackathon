import { Box, Button } from "@mui/material";
import React, { useContext } from "react";
import { FormContext } from "../../pages/dashboard/components/context/FormContext";
import CustomizedLoader from "../loader/CustomizedLoader";

const BtnStyle = {
  borderRadius: "4px",
  backgroundColor: "#0FC391",
  lineHeight: "21px",
  fontSize: "16px",
  paddingTop: "17px",
  paddingBottom: "17px",
  maxHeight: "50px",
  height: "100%",
  maxWidth: "250px",
  width: "100%",
  "&:hover": {
    backgroundColor: "#0FCCCE",
  },
};

const CreateButton = ({ text, onClick, disabled, loading }) => {
  return (
    <Button
      variant="contained"
      sx={BtnStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {!loading ? (
        text
      ) : (
        <CustomizedLoader type="circle" color="inherit" size="small" />
      )}
    </Button>
  );
};

export default CreateButton;
