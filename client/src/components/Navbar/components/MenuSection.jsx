import { Avatar, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { logout } from "../../../utils";
import RegularText from "../../texts/RegularText";
import nearAvatar from "../assets/avatarNear.svg";
import NearIcon from "./NearIcon";

const MenuStyle = {
  div: {
    boxShadow: "0px 12px 8px -6px rgba(174, 181, 239, 0.2)",
    borderRadius: "4px",
  },
  ul: {
    padding: "24px 0",
    paddingBottom: "8px",
  },
  li: {
    padding: "16px 28px",
    paddingTop: 0,
    "&:hover": {
      backgroundColor: "unset",
      "& > a , & > h6": {
        color: "#0FC391",
      },
    },
  },
  "a, h6": {
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "19px",
    color: "#3F4246",
    textDecoration: "none",
  },
};

const MenuSection = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <Avatar sx={{ width: "35px", height: "35px" }}>
          <NearIcon />
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        sx={MenuStyle}
      >
        <MenuItem>
          <Link to="/coming-soon">My Profile</Link>
        </MenuItem>
        <MenuItem>
          <Link to="/coming-soon">Change password</Link>
        </MenuItem>
        <MenuItem>
          <Typography variant="subtitle1" onClick={() => logout()}>
            Log out
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default MenuSection;
