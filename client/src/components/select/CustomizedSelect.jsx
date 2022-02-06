import { FormControl, InputLabel, Menu, MenuItem, Select } from "@mui/material";
import React from "react";
import { LabelStyle } from "../inputs/CustomizedReadInput";

const SelectStyles = {
  borderRadius: "4px",
  backgroundColor: "#fff",
  maxHeight: "36px",
  boxSizing: "border-box",
  height: "100%",
  border: "unset",
  fontSize: "12px",
  lineHeight: "16px",
  fontWeight: "500",
  input: {
    border: "1px solid #676767",
  },
  fieldset: {
    borderColor: "unset",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#14D9C1",
    borderWidth: "1px",
  },
  "&::after": {
    borderBottom: "2px solid #14D9C1",
  },
};

const SelectStandard = {
  fontSize: "16px",
  lineHeight: "16px",
  fontWeight: "500",
  "&::after": {
    borderBottom: "2px solid #14D9C1",
  },
};

const MenuStyles = {
  width: "310px",
  padding: "8px",
  border: "1px solid #14D9C1",
  borderRadius: "4px",
};

const MenuItemStyle = {
  fontSize: "12px",
  lineHeight: "16px",
  fontWeight: "500",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "#14D9C1",
    color: "#fff",
  },
};

const CustomizedSelect = ({
  options,
  variant = "outlined",
  labelName = undefined,
  fullWidth = false,
}) => {
  const handleChange = () => {};
  return (
    <>
      <FormControl variant="standard">
        {labelName && (
          <InputLabel id="selectId" sx={LabelStyle}>
            {labelName}
          </InputLabel>
        )}
        <Select
          value={options[0].value}
          onChange={handleChange}
          labelId="selectId"
          MenuProps={{
            MenuListProps: {
              sx: fullWidth ? { ...MenuStyles, width: "100%" } : MenuStyles,
            },
          }}
          sx={variant === "outlined" ? SelectStyles : SelectStandard}
          variant={variant}
        >
          {options.map((el, idx) => {
            return (
              <MenuItem value={el.value} key={idx} sx={MenuItemStyle}>
                {el.label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </>
  );
};

export default CustomizedSelect;
