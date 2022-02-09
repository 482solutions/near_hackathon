import "regenerator-runtime/runtime";
import React, { useEffect } from "react";
import "../../global.css";

import CreateCardsSection from "./components/CreateCardsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import { Grid } from "@mui/material";
import TitleText from "../../components/texts/TitleText";
import RegularText from "../../components/texts/RegularText";
import { getOrganisations } from "../../api/api.service";
import { create } from "ipfs-http-client";

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
  useEffect(() => {
    (async function () {
      const res = await getOrganisations();
      console.log(res);
      window.organisation = res?.[0]?.name;
    })();
  }, []);

  useEffect(() => {
    (async function () {
      const client = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
      });
      const res = await client.add("Hello near!");
      console.log(res);
    })();
  }, []);

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
