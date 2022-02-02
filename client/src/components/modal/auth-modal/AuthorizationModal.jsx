import { Grid, Box } from "@mui/material";
import React from "react";
import { login } from "../../../utils";
import NearIcon from "../../Navbar/components/NearIcon";
import RegularText from "../../texts/RegularText";
import TitleText from "../../texts/TitleText";
import CustomizedModal from "../CustomizedModal";
import smallArrow from "./assets/small-arrow.svg";

const AuthActionsContainerStyle = {
  maxWidth: "653px",
  minHeight: "109px",
  width: "100%",
  height: "100%",
  marginTop: "44px",
  border: "1px solid #0FC391",
  borderRadius: "20px",
  padding: "29px 45px 27px 35px",
  justifyContent: "space-between",
  "&:hover": {
    backgroundColor: "rgba(228, 255, 225, 0.3)",
    cursor: "pointer",
  },
  h6: {
    textAlign: "left",
  },
};

const NearIconBoxStyle = {
  width: "52px",
  height: "52px",
  img: {
    width: "100%",
    height: "100%",
  },
};

const AuthorizationModal = ({ isOpen, setIsModalOpen }) => {
  return (
    <CustomizedModal open={isOpen} handleClose={() => setIsModalOpen(false)}>
      <TitleText
        title={
          "Welcome!\n  Please, authorize to EACs Trading Platform to proceed"
        }
      />
      <Grid container sx={AuthActionsContainerStyle} onClick={() => login()}>
        <Grid container gap="38px" sx={{ width: "auto" }}>
          <Box sx={NearIconBoxStyle}>
            <NearIcon />
          </Box>
          <Grid item>
            <RegularText content="Authorize with NEAR" bold />
            <RegularText
              content="Connect using browser wallet"
              variant="small"
            />
          </Grid>
        </Grid>
        <img src={smallArrow} alt="arrow to Near" />
      </Grid>
    </CustomizedModal>
  );
};

export default AuthorizationModal;
