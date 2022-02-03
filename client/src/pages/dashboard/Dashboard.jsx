import "regenerator-runtime/runtime";
import React from "react";
import "../../global.css";

import getConfig from "../../config";
import CreateCardsSection from "./components/CreateCardsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import { Grid } from "@mui/material";
import TitleText from "../../components/texts/TitleText";
import RegularText from "../../components/texts/RegularText";

const TitleSectionWrapperStyle = {
  gap: "12px",
  justifyContent: "center",
  flexDirection: "column",
  "h6:first-of-type": {
    lineHeight: "41px",
  },
  "h6:last-of-type": {
    lineHeight: "27px",
  },
};

const Dashboard = () => {
  return (
    <Grid container gap={"29px"} sx={{ paddingTop: "43px" }}>
      <Grid container sx={TitleSectionWrapperStyle}>
        <TitleText title={"Dashboard"} variant="big" />
        <RegularText content={"You don't have any tokens yet.  Get Started."} />
      </Grid>
      <HowItWorksSection />
      <CreateCardsSection />
    </Grid>
  );
};

export default Dashboard;
