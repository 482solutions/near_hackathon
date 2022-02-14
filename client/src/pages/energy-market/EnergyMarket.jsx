import { Grid, Box } from "@mui/material";
import React from "react";
import DataSection from "./components/DataSection";
import FormSection from "./components/FormSection";

const MainWrapperStyle = {
  padding: " 36px 53px",
  width: "100%",
  minHeight: "inherit",
};

const SectionData = [
  {
    title: "Asks",
    matchingData: "3/3",
    data: ["Type", "MWh", "Price"],
  },
  {
    title: "Bids",
    matchingData: "0/3",
    data: ["Price", "MWh", "Type"],
  },
];

const EnergyMarket = () => {
  return (
    <Grid container sx={MainWrapperStyle} gap="27px" justifyContent={"center"}>
      <FormSection />
      <Grid
        container
        sx={{ width: "auto", height: "100%" }}
        gap="27px"
        flexDirection={"column"}
      >
        {SectionData.map((el, idx) => {
          return (
            <DataSection
              title={el.title}
              matchingData={el.matchingData}
              data={el.data}
              key={idx}
            />
          );
        })}
      </Grid>
    </Grid>
  );
};

export default EnergyMarket;
