import { Grid, InputLabel, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomizedSelect from "../select/CustomizedSelect";

const GridStyle = {
  maxWidth: "310px",
};

const LabelStyle = {
  fontSize: "14px",
  lineHeight: "19px",
  color: "#3F4246",
  span: {
    color: "red",
  },
};

export const InputStyle = {
  height: "36px",
  boxSizing: "border-box",
  input: {
    boxSizing: "border-box",
    border: "1px solid #676767",
    backgroundColor: "#FFFFFF",
    borderRadius: "4px",
    caretColor: "unset",
    padding: "10px 13px",
    height: "36px",
    fontSize: "14px",
  },
  "input:focus": {
    border: "1px solid #0FC391",
    boxShadow: "unset",
  },
  "input::placeholder": {
    color: "#676767",
    fontSize: "12px",
    lineHeight: "16px",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    display: "none",
  },
};

const CustomizedInput = ({
  labelName,
  options,
  passUpValue,
  error,
  resetData = false,
  initialValue = "",
  disabled = false,
  type = "text",
  required = false,
  isSelect = false,
  minValue = undefined,
}) => {
  const [value, setValue] = useState("");
  const [localError, setLocalError] = useState(error);

  useEffect(() => {
    setValue("");
  }, [resetData]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleFormChange = (e) => {
    if (localError && e.target.value !== "") {
      setLocalError(false);
    }
    passUpValue(e.target.value);
    setValue(e.target.value);
  };

  return (
    <Grid container gap="4px" flexDirection={"column"} sx={GridStyle}>
      <InputLabel sx={LabelStyle}>
        {labelName}
        {required ? <span> *</span> : ""}
      </InputLabel>
      {!isSelect ? (
        <TextField
          sx={InputStyle}
          error={localError}
          type={type}
          inputProps={{ min: minValue }}
          placeholder={labelName}
          name={labelName}
          value={value}
          onChange={(e) => handleFormChange(e)}
          disabled={disabled}
        />
      ) : (
        <CustomizedSelect
          value={value}
          error={localError}
          disabled={disabled}
          handleChange={handleFormChange}
          options={options}
        />
      )}
    </Grid>
  );
};

export default CustomizedInput;
