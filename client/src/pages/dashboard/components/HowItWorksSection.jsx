import { Box, Grid } from "@mui/material";
import React from "react";
import RegularText from "../../../components/texts/RegularText";
import TitleText from "../../../components/texts/TitleText";
import companyImg from "./assets/companyImg.svg";
import hydroStationImg from "./assets/hydroStationImg.svg";
import createEacImg from "./assets/createEacImg.svg";
import arrow from "./assets/arrow.svg";
import diagramImg from "./assets/diagramImg.svg";

const imgSectionData = [
  {
    img: companyImg,
    label: "Create company",
  },
  {
    img: arrow,
  },
  {
    img: hydroStationImg,
    label: "Create Station",
  },
  {
    img: arrow,
  },
  {
    img: createEacImg,
    label: "Create EAC",
  },
];

const BoxStyle = {
  maxWidth: "500px",
  width: "100%",
  height: "229px",
  boxShadow: "0px 12px 8px -6px rgba(174, 181, 239, 0.2)",
  borderRadius: "4px",
  backgroundColor: "#FFFFFF",
  padding: "28px 32px",
  h6: {
    textAlign: "left",
  },
};

const ImagesWrapperStyle = {
  marginTop: "32px",
  marginBottom: "12px",
  justifyContent: "space-between",
  alignItems: "center",
  img: {
    maxHeight: "80px",
  },
};

const HowItWorksSection = () => {
  return (
    <Grid container justifyContent={"center"} gap="38px">
      <Box sx={BoxStyle}>
        <TitleText title={"How does this work?"} />
        <Grid container sx={ImagesWrapperStyle}>
          {imgSectionData.map((el, index) => {
            return (
              <Grid key={index}>
                <img src={el.img} alt="logo" key={index} />
                {el.label && <RegularText content={el.label} variant="small" />}
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <Box sx={BoxStyle}>
        <img src={diagramImg} alt="diagram" />
      </Box>
    </Grid>
  );
};

export default HowItWorksSection;
