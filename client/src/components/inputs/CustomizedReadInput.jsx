import { InputAdornment, TextField } from "@mui/material";
import React from "react";

export const LabelStyle = {
  fontWeight: 500,
  fontSize: "18px",
  "&.Mui-focused": {
    color: "#14D9C1",
  },
};

const CustomizedReadInput = ({
  labelName,
  controlled = false,
  type = "text",
  defaultValue = "N/A",
  value = undefined,
  onChange = undefined,
  adornMent = "",
  disabled = false,
  adornMentDirection = "endAdornment",
}) => {
  return (
    <>
      <TextField
        variant="standard"
        type={type}
        fullWidth
        label={labelName}
        defaultValue={controlled ? undefined : defaultValue}
        value={value}
        onChange={onChange}
        sx={{
          label: {
            ...LabelStyle,
          },
          "> div": {
            "&::before": {
              borderBottomStyle: "solid !important",
            },
            "&::after": {
              borderBottom: "2px solid #14D9C1",
            },
          },
        }}
        InputProps={{
          sx: { fontSize: "15px" },
          [adornMentDirection]: adornMent ? (
            <InputAdornment
              position={adornMentDirection === "endAdormnet" ? "end" : "start"}
              sx={{ "> p": { fontSize: "16px", fontWeight: 400 } }}
            >
              {adornMent}
            </InputAdornment>
          ) : undefined,
        }}
        disabled={disabled}
      />
    </>
  );
};

export default CustomizedReadInput;
