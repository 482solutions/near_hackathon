import { Container, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import AuthorizationModal from "../../modal/auth-modal/AuthorizationModal";
import Navbar from "../../Navbar/Navbar";
import Sidebar from "../../Sidebar/Sidebar";

const LayoutStyle = {
  width: "100%",
  height: "100%",
  minHeight: "100vh",
  backgroundColor: "#fff",
  paddingRight: "25px",
  paddingBottom: "20px",
  paddingLeft: "256px",
  paddingTop: "88px",
};

const ContainerStyle = {
  height: "100%",
  minHeight: "calc(100vh - 108px)",
  backgroundColor: "#F5F5F5",
  overflow: "hidden",
};

const MainWrapper = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Grid sx={LayoutStyle}>
      <Sidebar setIsModalOpen={setIsOpen} />
      <Navbar setIsModalOpen={setIsOpen} />
      <Box sx={ContainerStyle}>{children}</Box>
      <AuthorizationModal isOpen={isOpen} setIsModalOpen={setIsOpen} />
    </Grid>
  );
};

export default MainWrapper;
