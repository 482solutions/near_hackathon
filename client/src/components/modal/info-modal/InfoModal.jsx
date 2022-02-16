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

const InfoModal = ({ open, setOpen, img, keyWord, infoType }) => {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const content = {
    success: {
      title: "Congrats!",
      description: `You successfully ${
        keyWord === "Company" ? "register" : "create"
      } ${keyWord}`,
      btnText: keyWord === "EAC" ? "OK!" : "Next step",
    },
    error: {
      title: "Error!",
      description: infoType.msg,
      btnText: "Try again!",
    },
  };

  const handleClick = () => {
    if (infoType.type === "error") {
      navigate("/dashboard", {
        state: {
          nextModal: keyWord,
        },
      });
      handleClose();
      return;
    }
    if (keyWord !== "EAC") {
      navigate("/dashboard", {
        state: {
          nextModal: keyWord === "Company" ? "Station" : "EAC",
        },
      });
    }
    handleClose();
  };

  return (
    <CustomizedModal open={open} handleClose={handleClose}>
      <Box sx={WrapperBoxStyle}>
        <RegularText content={content[infoType.type].title} />
        <Grid container justifyContent={"center"}>
          <img src={img} alt={keyWord} />
        </Grid>
        <RegularText content={content[infoType.type].description} />
        <Box sx={{ height: "36px", maxWidth: "180px", width: "100%" }}>
          <CreateButton
            text={content[infoType.type].btnText}
            onClick={handleClick}
          />
        </Box>
      </Box>
    </CustomizedModal>
  );
};

export default InfoModal;
