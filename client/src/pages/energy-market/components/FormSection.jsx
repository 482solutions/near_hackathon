import { Box, Grid } from "@mui/material";
import { Contract } from "near-api-js";
import React from "react";
import CreateButton from "../../../components/buttons/CreateButton";
import CustomizedToggleButton from "../../../components/buttons/CustomizedToggleButton";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
import CustomizedReadInput from "../../../components/inputs/CustomizedReadInput";
import CustomizedSelect from "../../../components/select/CustomizedSelect";
import RegularText from "../../../components/texts/RegularText";

const FirstBoxStyle = {
  maxWidth: "421px",
  width: "100%",
  height: "100%",
  backgroundColor: "#fff",
  padding: "40px 45px 51px",
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

const FormSection = () => {
  const handleSubmit = async () => {
    const contract = await new Contract(
      window.walletConnection.account(),
      "market.dev-1644489132064-20411269655435",
      {
        viewMethods: ["get_supply_asks", "get_asks", "get_ask"],
        changeMethods: ["setMarket"],
      }
    );
    const res = await contract["get_ask"]();

    console.log(res);
  };
  return (
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
        <CustomizedToggleButton toggleData={toggleData} />
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
        <CreateButton text="Place Bid Order" onClick={handleSubmit} />
      </Grid>
    </Box>
  );
};

export default FormSection;
