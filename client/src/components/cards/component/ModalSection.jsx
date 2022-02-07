import { Container, Modal, Typography, Box, Grid } from "@mui/material";
import React, { useState } from "react";
import CreateButton from "../../buttons/CreateButton";
import CustomizedInput from "../../inputs/CustomizedInput";
import CustomizedModal from "../../modal/CustomizedModal";
import CustomizedSelect from "../../select/CustomizedSelect";
import RegularText from "../../texts/RegularText";
import TitleText from "../../texts/TitleText";

const InputsData = {
  Station: [
    {
      title: "Facility name",
    },
    {
      title: "Device owner",
    },
    {
      title: "Date of commercial exp",
    },
    {
      title: "Registrational date",
    },
    {
      title: "Type of national aid",
    },
    {
      title: "API ID",
    },
  ],
  Company: [
    {
      title: "Organization Name",
      required: true,
    },
    {
      title: "Organization Address",
      required: true,
    },
    {
      title: "Business type",
      required: true,
      isSelect: true,
      options: ["Private", "Public", "Holding and Subsidary", "Associate"].map(
        (i) => ({ value: i, label: `${i} Companies` })
      ),
    },
    {
      title: "Trade Registry Company number",
      require: true,
    },
    {
      title: "Signatory Full Name",
      required: true,
    },
    {
      title: "Signatory Address",
      required: true,
    },
    {
      title: "Signatory Email",
      required: true,
    },
    {
      title: "Signatory Telephone",
      required: true,
    },
  ],
  EAC: [
    {
      title: "Start date of creation",
    },
    {
      title: "End date of creation",
    },
    {
      title: "Amount of energy in MWh",
    },
  ],
};

const BtnContainerStyle = {
  maxWidth: "141px",
  width: "100%",
  height: "36px",
};

const BtnContainerWrapperStyle = {
  marginTop: "40px",
  justifyContent: "center",
};

const TitleContainerStyle = {
  gap: "7px",
  justifyContent: "center",
  flexDirection: "column",
  marginBottom: "32px",
};

const ModalSection = ({ btnText }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <CreateButton
        text={btnText}
        onClick={handleOpen}
        disabled={!window.walletConnection.isSignedIn()}
      />
      <CustomizedModal open={open} handleClose={handleClose}>
        <Grid container sx={TitleContainerStyle}>
          <TitleText title={btnText} />
          <RegularText
            content={`Please enter ${btnText.split(" ")[1]} info`}
            variant="small"
          />
        </Grid>
        <Grid container rowGap={"13px"} columnGap={"25px"}>
          {InputsData[btnText.split(" ")[1]].map((i, idx) => {
            return (
              <CustomizedInput
                labelName={i.title}
                required={i?.required}
                key={idx}
                isSelect={i.isSelect}
                options={i?.options ?? []}
              />
            );
          })}
        </Grid>
        <Grid container sx={BtnContainerWrapperStyle}>
          <Grid item sx={BtnContainerStyle}>
            <CreateButton text="Submit" />
          </Grid>
        </Grid>
      </CustomizedModal>
    </>
  );
};

export default ModalSection;
