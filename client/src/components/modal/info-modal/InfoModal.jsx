import { Box, Grid } from "@mui/material";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RegularText from "../../texts/RegularText";
import CustomizedModal from "../CustomizedModal";
import CreateButton from "../../buttons/CreateButton";

const WrapperBoxStyle = {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  gap: "40px",
};

const InfoModal = ({ open, setOpen, img, keyWord }) => {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleClick = () => {
    if (keyWord !== "EAC") {
      navigate("/", {
        state: {
          nextModal: keyWord === "Company" ? "Station" : "EAC",
        },
      });
      handleClose();
    }
  };

  return (
    <CustomizedModal open={open} handleClose={handleClose}>
      <Box sx={WrapperBoxStyle}>
        <RegularText content={"Congrats!"} />
        <Grid container justifyContent={"center"}>
          <img src={img} alt={keyWord} />
        </Grid>
        <RegularText
          content={`You successfully ${
            keyWord === "Company" ? "register" : "create"
          } ${keyWord}`}
        />
        <Box sx={{ height: "36px", maxWidth: "180px", width: "100%" }}>
          <CreateButton
            text={keyWord === "EAC" ? "OK!" : "Next step"}
            onClick={handleClick}
          />
        </Box>
      </Box>
    </CustomizedModal>
  );
};

export default InfoModal;
