import {
  Grid,
  Box,
  InputLabel,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import CreateButton from "../../components/buttons/CreateButton";
import SecondaryButton from "../../components/buttons/SecondaryButton";
import CustomizedReadInput from "../../components/inputs/CustomizedReadInput";
import CustomizedSelect from "../../components/select/CustomizedSelect";
import CustomizedTable from "../../components/table/CustomizedTable";
import RegularText from "../../components/texts/RegularText";
import TitleText from "../../components/texts/TitleText";

const MainWrapperStyle = {
  padding: " 36px 53px",
  width: "100%",
  minHeight: "inherit",
};

const FirstBoxStyle = {
  maxWidth: "421px",
  width: "100%",
  height: "100%",
  backgroundColor: "#fff",
  padding: "40px 45px 51px",
};

const SecondBoxStyle = {
  maxWidth: "605px",
  width: "100%",
  height: "100%",
  backgroundColor: "#fff",
  padding: "40px 43px 31px",
  maxHeight: "427px",
};

const TableContainerStyle = {
  "> div": {
    padding: "26px 0px 0px",
    boxShadow: "unset",
    "thead > tr": {
      backgroundColor: "#fff",
    },
  },
};

const SelectsData = [
  {
    labelName: "Device type",
  },
  {
    labelName: "Location",
  },
  {
    labelName: "Grid operator",
  },
];

const toggleData = [
  {
    value: "one_time_purchase",
    label: "One-Time Purchase",
  },
  {
    value: "repeated_purchase",
    label: "Repeated Purchase",
  },
];

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

const ButtonsContainer = {
  flexWrap: "nowrap",
  height: "36px",
  gap: "10px",
  marginTop: "43px",
  "> button": {
    fontSize: "12px",
    "&:last-of-type": {
      maxWidth: "181px",
    },
  },
};

const EnergyMarket = () => {
  const [toggleValue, setToggleValue] = useState(toggleData[0].value);

  const handleToggleChange = (event, newAlignment) => {
    if (newAlignment === null) return;
    setToggleValue(newAlignment);
  };

  return (
    <Grid container sx={MainWrapperStyle} gap="27px" justifyContent={"center"}>
      <Box sx={FirstBoxStyle}>
        <RegularText content={"Browse by keyword and attributes"} />
        <Grid container sx={{ width: "100%", marginTop: "28px" }} gap={"10px"}>
          {SelectsData.map((i, idx) => {
            return (
              <Grid
                container
                flexDirection={"column"}
                gap={"4px"}
                sx={{ h6: { textAlign: "left" } }}
                key={idx}
              >
                <RegularText content={i.labelName} variant="small" />
                <CustomizedSelect
                  fullWidth
                  options={[{ value: "asd", label: "asd" }]}
                />
              </Grid>
            );
          })}
        </Grid>
        <Grid container sx={{ marginTop: "24px" }}>
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
              >
                {i.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>
        <Grid container gap={"20px"} sx={{ marginTop: "32px" }}>
          <CustomizedReadInput labelName={"Energy*"} adornMent="MWh" />
          <CustomizedReadInput labelName={"Price*"} adornMent="USD" />
          <CustomizedReadInput
            labelName={"Total*"}
            adornMent="USD"
            adornMentDirection="startAdornment"
          />
        </Grid>
        <Grid container sx={ButtonsContainer}>
          <SecondaryButton text={"Clear All"} />
          <CreateButton text="Place Bid Order" />
        </Grid>
      </Box>
      <Grid
        container
        sx={{ width: "auto", height: "100%" }}
        gap="27px"
        flexDirection={"column"}
      >
        <Box sx={SecondBoxStyle}>
          <TitleText title={"Asks"} />
          <RegularText content={"3/3 Matching"} />
          <Grid sx={TableContainerStyle}>
            <CustomizedTable headData={["Type", "MWh", "Price"]} />
          </Grid>
        </Box>
        <Box sx={SecondBoxStyle}>
          <TitleText title={"Bids"} />
          <RegularText content={"0/0 Matching"} />
          <Grid sx={TableContainerStyle}>
            <CustomizedTable headData={["Price", "MWh", "Type"]} />
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default EnergyMarket;
