import { Box, Typography } from "@mui/material";
import React from "react";
import RegularText from "../texts/RegularText";
import TitleText from "../texts/TitleText";
import ModalSection from "./component/ModalSection";

const BoxStyle = {
  width: "100%",
  maxWidth: "320px",
  height: "100%",
  minHeight: "432px",
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
  padding: "0 35px",
  paddingTop: "28px",
  paddingBottom: "36px",
  alignItems: "center",
  justifyContent: "space-between",
};

const Card = ({ title, img, description, btnText }) => {
  return (
    <Box sx={BoxStyle}>
      <TitleText title={title} />
      <img src={img} alt={title} style={{ width: "fit-content" }} />
      <RegularText content={description} />
      <ModalSection
        btnText={btnText}
        keyWord={btnText.split(" ")[1]}
        img={img}
      />
    </Box>
  );
};

export default Card;
