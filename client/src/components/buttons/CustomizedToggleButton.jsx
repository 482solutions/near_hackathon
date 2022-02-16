import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import React, { useState } from "react";

const ToggleButtonStyle = {
  width: "166px",
  height: "36px",
  border: "1px solid #14D9C1",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "16px",
  padding: "10px 8px",
  "&.Mui-selected": {
    backgroundColor: "#14D9C1",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#0FCCCE",
    },
  },
};

const CustomizedToggleButton = ({
  toggleData,
  passUpToggleValue,
  disabled,
}) => {
  const [toggleValue, setToggleValue] = useState(toggleData[0].value);

  const handleToggleChange = (_, newAlignment) => {
    if (newAlignment === null) return;
    setToggleValue(newAlignment);
    passUpToggleValue(newAlignment);
  };
  return (
    <ToggleButtonGroup
      value={toggleValue}
      exclusive
      onChange={handleToggleChange}
    >
      {toggleData.map((i) => (
        <ToggleButton
          key={i.value}
          value={i.value}
          sx={ToggleButtonStyle}
          disabled={disabled}
        >
          {i.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default CustomizedToggleButton;
