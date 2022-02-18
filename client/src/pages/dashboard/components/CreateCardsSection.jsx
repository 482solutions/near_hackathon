import React, { useRef } from "react";
import Card from "../../../components/cards/Card";
import companyImg from "./assets/companyImg.svg";
import stationsImg from "./assets/stationsImg.svg";
import createEacImg from "./assets/createEacImg.svg";
import { Grid } from "@mui/material";

const cardsData = [
  {
    id: 1,
    title: "Registration of company",
    description: "Create company profile",
    img: companyImg,
    btnText: "Create Company",
  },
  {
    id: 2,
    title: "Choose a renewables station",
    description:
      "Renewables, including solar, wind, hydro, biofuels and others",
    img: stationsImg,
    btnText: "Create Station",
  },
  {
    id: 3,
    title: "Create EAC",
    description: "Energy Attribute Certificate",
    img: createEacImg,
    btnText: "Create EAC",
  },
];

const CreateCardsSection = () => {
  const stationDataRef = useRef();

  return (
    <Grid container gap="40px" justifyContent={"center"} flexDirection={"row"}>
      {cardsData.map((el) => {
        return (
          <Card
            title={el.title}
            description={el.description}
            img={el.img}
            btnText={el.btnText}
            key={el.id}
            stationData={stationDataRef}
          />
        );
      })}
    </Grid>
  );
};

export default CreateCardsSection;
