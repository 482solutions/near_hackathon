import React from "react";
import { Grid, Stack } from "@mui/material";
import { Box } from "@mui/system";
import img from "./assets/structureImg.svg";
import img2 from "./assets/eacsLogo.svg";

const BoxStyled = {
  background:
    "linear-gradient(67.87deg, rgba(65, 170, 56, 0.78) 0.01%, #96E3FF 99.27%)",
  boxShadow: "0px 4px 32px rgba(0, 0, 0, 0.1)",
  borderRadius: "4px",
  height: "100vh",
  width: "100%",
  position: "relative",
  transform: "matrix(-1, 0, 0, 1, 0, 0)",
  "&::before": {
    content: "''",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: `url(${img})`,
    backgroundPosition: "center",
    width: "100%",
    height: "100%",
    backgroundRepeat: "no-repeat",
  },
};

const GridStyle = {
  width: "100%",
  background: "#FFFFFF",
  borderRadius: "4px 0px 0px 4px",
  justifyContent: "center",
};

const SignIn = () => {
  return (
    <>
      <Stack direction={"row"}>
        <Box sx={BoxStyled} />
        <Grid container sx={GridStyle}>
          <img src={img2} alt="eac's logo" />
        </Grid>
      </Stack>
    </>
  );
};

export default SignIn;
