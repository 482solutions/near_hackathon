import { Menu, MenuItem, Select } from "@mui/material";
import React from "react";

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

const CustomizedSelect = ({ options }) => {
  const handleChange = () => {};
  return (
    <Select
      value={options[0].value}
      onChange={handleChange}
      MenuProps={{ MenuListProps: { sx: MenuStyles } }}
      sx={SelectStyles}
    >
      {options.map((el, idx) => {
        return (
          <MenuItem value={el.value} key={idx} sx={MenuItemStyle}>
            {el.label}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default CustomizedSelect;
