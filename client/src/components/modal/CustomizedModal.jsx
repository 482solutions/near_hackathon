import { Box, Modal } from "@mui/material";
import React from "react";
import closeIcon from "./assets/closeIcon.svg";

const BoxStyle = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%,-50%)",
  backgroundColor: "#fff",
  width: "100%",
  maxWidth: "769px",
  padding: "70px 62px 42px",
  borderRadius: "4px",
  "> img": {
    position: "absolute",
    top: 0,
    right: 0,
    marginTop: "28px",
    marginRight: "27px",
    cursor: "pointer",
  },
};

const CustomizedModal = ({ open, handleClose, children }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={BoxStyle}>
        <img src={closeIcon} alt={"close icon"} onClick={handleClose} />
        {children}
      </Box>
    </Modal>
  );
};

export default CustomizedModal;
