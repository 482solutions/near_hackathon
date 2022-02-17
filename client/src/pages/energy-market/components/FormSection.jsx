import { Box, Grid } from "@mui/material";
import { allCountries } from "country-region-data";
import { Contract } from "near-api-js";
import React, { useCallback, useEffect, useState } from "react";
import {
  getNFTs,
  getStationByOrgAndStationName,
} from "../../../api/api.service";
import CreateButton from "../../../components/buttons/CreateButton";
import CustomizedToggleButton from "../../../components/buttons/CustomizedToggleButton";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
import { transformedToSelectCountries } from "../../../components/cards/component/constants";
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
    options: [
      "Solar",
      "Wind",
      "Liquid",
      "Hydro - Electric head",
      "Gaseous",
      "Thermal",
    ].map((i) => ({ label: i, value: i })),
  },
  {
    labelName: "Location",
    options: transformedToSelectCountries,
  },
  // {
  //   labelName: "Grid operator",
  //   options: [
  //     "Solar",
  //     "Wind",
  //     "Liquid",
  //     "Hydro - Electric head",
  //     "Gaseous",
  //     "Thermal",
  //   ].map((i) => ({ label: i, value: i })),
  // },
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
    adornMent: "Near",
  },
];

const FormSection = ({ asks, form, setForm, handleFormChange, placeBid }) => {
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
                options={i.options}
                value={form[i.labelName] ?? []}
                handleChange={(e) => handleFormChange(e, i.labelName)}
                disabled={!window.walletConnection.isSignedIn()}
              />
            </Grid>
          );
        })}
      </Grid>

      <Grid container gap={"20px"} sx={{ marginTop: "32px" }}>
        {InputsData.map((i) => {
          return (
            <CustomizedReadInput
              controlled
              type="number"
              value={form[i.labelName] ?? ""}
              onChange={(e) => handleFormChange(e, i.labelName)}
              labelName={i.labelName}
              adornMent={i.adornMent}
              adornMentDirection={i.adornMentDirection && "startAdornment"}
              disabled={!window.walletConnection.isSignedIn()}
            />
          );
        })}
      </Grid>
      <Grid container sx={ButtonsContainer}>
        <SecondaryButton
          text={"Clear All"}
          onClick={() => setForm({})}
          disabled={!window.walletConnection.isSignedIn()}
        />
        <CreateButton
          text="Place Bid Order"
          disabled={!window.walletConnection.isSignedIn()}
          onClick={() => placeBid()}
        />
      </Grid>
    </Box>
  );
};

export default FormSection;
