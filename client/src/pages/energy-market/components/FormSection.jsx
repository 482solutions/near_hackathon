import { Box, Grid } from "@mui/material";
import { Contract } from "near-api-js";
import React, { useCallback, useState } from "react";
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

const InputsData = [
  {
    labelName: "Energy*",
    adornMent: "MWh",
  },
  {
    labelName: "Price*",
    adornMent: "USD",
  },
  {
    labelName: "Total*",
    adornMent: "USD",
    adornMentDirection: "startAdornment",
  },
];

const FormSection = ({ asks }) => {
  const [form, setForm] = useState({});

  const handleFormChange = useCallback((e, labelName) => {
    setForm((prev) => ({ ...prev, [labelName]: e.target.value }));
  }, []);

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
                value={form[i.labelName] ?? ""}
                handleChange={(e) => handleFormChange(e, i.labelName)}
              />
            </Grid>
          );
        })}
      </Grid>
      <Grid container sx={{ marginTop: "24px" }}>
        <CustomizedToggleButton
          toggleData={toggleData}
          passUpToggleValue={(e) => setForm((prev) => ({ ...prev }))}
        />
      </Grid>
      <Grid container gap={"20px"} sx={{ marginTop: "32px" }}>
        {InputsData.map((i) => {
          return (
            <CustomizedReadInput
              controlled
              value={form[i.labelName] ?? ""}
              onChange={(e) => handleFormChange(e, i.labelName)}
              labelName={i.labelName}
              adornMent={i.adornMent}
              adornMentDirection={i.adornMentDirection && "startAdornment"}
            />
          );
        })}
      </Grid>
      <Grid container sx={ButtonsContainer}>
        <SecondaryButton text={"Clear All"} />
        <CreateButton text="Place Bid Order" />
      </Grid>
    </Box>
  );
};

export default FormSection;
