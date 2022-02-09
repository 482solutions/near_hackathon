import "regenerator-runtime/runtime";
import React, { useEffect, useLayoutEffect } from "react";
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
  useLayoutEffect(() => {
    if (
      window.walletConnection.isSignedIn() &&
      !document.cookie.includes("privateKey")
    ) {
      document.cookie = `privateKey = ${localStorage.getItem(
        `near-api-js:keystore:${window.walletConnection._authData.accountId}:${walletConnection._networkId}`
      )}`;
    }
  }, []);

  useEffect(() => {
    console.log("here");
    (async function () {
      if (!localStorage.getItem("organisation")) {
        const res = await getOrganisations();
        if (res?.[0]?.name)
          localStorage.setItem("organisation", res?.[0]?.name);
      }
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
