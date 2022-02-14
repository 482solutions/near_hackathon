import { Drawer, Grid, List, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import RegularText from "../texts/RegularText";
import TitleText from "../texts/TitleText";
import eacsLogo from "./assets/eacsLogo.svg";

const DrawerStyle = {
  padding: "0 18px 30px",
  boxShadow: "unset",
  border: "unset",
  maxWidth: "256px",
  width: "100%",
  justifyContent: "space-between",
  ul: {
    paddingTop: "47px",
    "li:first-of-type": {
      justifyContent: "center",
      paddingBottom: "0",
      marginBottom: "26px",
    },
  },
};

const ListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  span: {
    color: "#3F4246",
    fontSize: "18px",
    lineHeight: "25px",
  },
};

const ListItemStyle = {
  paddingLeft: "45px",
  a: {
    textDecoration: "none",
  },
  "&:hover": {
    backgroundColor: "rgba(228, 255, 225, 0.3)",
  },
};

const TextContainerStyle = {
  h6: {
    "&:first-of-type": {
      fontSize: "16px",
      lineHeight: "23px",
    },
    "&:last-of-type": {
      fontSize: "14px",
      lineHeight: "26px",
      marginTop: "2px",
    },
  },
};

const paths = [
  {
    imgSrc: eacsLogo,
    text: "eac's logo",
    path: "/dashboard",
  },
  {
    text: "Energy market",
    path: "/",
  },
  {
    text: "My EAC's",
    path: "/my-eacs",
  },
  {
    text: "Settings",
    path: "/coming-soon",
  },
];

const Sidebar = ({ setIsModalOpen }) => {
  const navigate = useNavigate();
  const clickHandler = (path) => {
    if (!window.walletConnection.isSignedIn()) {
      return setIsModalOpen(true);
    }
    navigate(path);
  };
  return (
    <Drawer variant="permanent" anchor="left" PaperProps={{ sx: DrawerStyle }}>
      <List sx={ListStyle}>
        {paths.map((el, idx) => (
          <ListItem
            button={!el.imgSrc}
            key={idx}
            sx={!el.imgSrc ? ListItemStyle : { cursor: "pointer" }}
            onClick={() => clickHandler(el.path)}
          >
            {el.imgSrc ? (
              <img src={el.imgSrc} alt={el.text} />
            ) : (
              <ListItemText primary={el.text} />
            )}
          </ListItem>
        ))}
      </List>
      <Grid sx={TextContainerStyle}>
        <TitleText title={"NEAR MetaBUILD Hackathon"} />
        <RegularText
          content={`© ${new Date().getFullYear()} All Rights Reserved`}
        />
      </Grid>
    </Drawer>
  );
};

export default Sidebar;
