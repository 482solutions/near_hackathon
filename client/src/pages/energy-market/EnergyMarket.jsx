import { Grid, Box } from "@mui/material";
import { Contract } from "near-api-js";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
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
    data: ["Type", "MWh", "Price", "Buy directly"],
  },
  {
    title: "Bids",
    matchingData: "0/3",
    data: ["Price", "MWh", "Type"],
  },
];

let contract;

const EnergyMarket = () => {
  const [asks, setAsks] = useState();
  const [bids, setBids] = useState();
  const getAsksFromContract = useCallback(async () => {
    contract = await new Contract(
      window.walletConnection.account(),
      "market.dev-1645073849820-60274470736035",
      {
        viewMethods: ["get_supply_bids", "get_bids", "get_asks"],
        changeMethods: ["direct_ask_sell"],
      }
    );
    const resAsks = await contract["get_asks"]({});
    const resBids = await contract["get_bids"]({});
    const MockAsks = [
      {
        owner_id: "asd.testnet",
        nft_contract_id: "5",
        token_id: "18",
        approval_id: "asdasd846541",
        sale_conditions: "50",
      },
    ];

    const MockBids = [
      {
        owner_id: "asd.testnet",
        sale_conditions: "50",
      },
    ];
    setAsks(MockAsks);
    setBids(MockBids);
  }, []);

  useEffect(() => {
    getAsksFromContract();
  }, [getAsksFromContract]);
  return (
    <Grid container sx={MainWrapperStyle} gap="27px" justifyContent={"center"}>
      <FormSection asks={asks} />
      <Grid
        container
        sx={{ width: "100%", height: "100%", maxWidth: "605px" }}
        gap="27px"
        flexDirection={"column"}
      >
        {SectionData.map((el, idx) => {
          return (
            <DataSection
              title={el.title}
              matchingData={el.matchingData}
              data={el.data}
              bodyData={el.title === "Asks" ? asks : bids}
              contractInstance={contract}
              key={idx}
            />
          );
        })}
      </Grid>
    </Grid>
  );
};

export default EnergyMarket;
