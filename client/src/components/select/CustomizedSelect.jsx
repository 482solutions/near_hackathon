import { MenuItem, Select } from "@mui/material";
import React from "react";

const SelectStyles = {
  borderRadius: "4px",
  backgroundColor: "#fff",
  border: "1px solid #676767",
  maxHeight: "36px",
};

const CustomizedSelect = ({ options }) => {
  const handleChange = () => {};
  return (
    <Select value={5} onChange={handleChange} sx={SelectStyles}>
      {options.map((el, idx) => {
        return (
          <MenuItem value={el.value} key={idx}>
            {el.label}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default CustomizedSelect;
