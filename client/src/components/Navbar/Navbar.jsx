import React, { useState } from "react";
import {
  AppBar,
  Typography,
  Grid,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import icon from "./assets/ringIcon.svg";
import { Link } from "react-router-dom";
import MenuSection from "./components/MenuSection";
import CreateButton from "../buttons/CreateButton";

const HeaderStyle = {
  maxHeight: "88px",
  height: "100%",
  alignItems: "space-between",
  justifyContent: "center",
  backgroundColor: "#FFFFFF",
  borderRadius: "4px",
  boxShadow: "none",
  padding: "32px",
  paddingLeft: "282px",
  flexDirection: "row",
};

const TypographyStyle = {
  color: "#3F4246",
  fontSize: "20px",
  fontWeight: 400,
};

const ParagraghStyle = {
  fontWeight: 500,
  fontSize: "18px",
  lineHeight: "25px",
  color: "#676767",
};

const Navbar = ({ setIsModalOpen }) => {
  return (
    <AppBar sx={HeaderStyle}>
      <Grid container>
        <Typography sx={TypographyStyle} variant="subtitle1">
          EACs Trading Platform
        </Typography>
      </Grid>
      <Grid
        justifyContent={"flex-end"}
        alignItems={"center"}
        gap={"8px"}
        container
      >
        {window.walletConnection.isSignedIn() ? (
          <>
            <Link to="/coming-soon">
              <img src={icon} alt="ring icon" />
            </Link>
            <Typography variant="subtitle1" sx={ParagraghStyle}>
              {window.walletConnection._authData.accountId}
            </Typography>
            <MenuSection />
          </>
        ) : (
          <CreateButton text="Log in" onClick={() => setIsModalOpen(true)} />
        )}
      </Grid>
    </AppBar>
  );
};

export default Navbar;
