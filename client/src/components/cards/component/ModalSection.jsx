import { Container, Modal, Typography, Box, Grid } from "@mui/material";
import React, { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { async } from "regenerator-runtime";
import {
  createMeasurment,
  createOrganisation,
  createStation,
  getStation,
} from "../../../api/api.service";
import Form from "../../../pages/dashboard/components/context/FormContext";
import CreateButton from "../../buttons/CreateButton";
import CustomizedInput from "../../inputs/CustomizedInput";
import CustomizedModal from "../../modal/CustomizedModal";
import RegularText from "../../texts/RegularText";
import TitleText from "../../texts/TitleText";

const InputsData = {
  Station: [
    {
      title: "Facility name",
      required: true,
    },
    {
      title: "Device type",
      isSelect: true,
      options: [
        "Solar Photovoltaic",
        "Solar Concentration",
        "Wind",
        "Hydro - Electric head",
        "Marine",
        "Solid",
        "Liquid",
        "Gasous",
        "Thermal",
      ].map((i) => ({ label: i, value: i })),
    },
    {
      title: "Station placement",
      required: true,
    },
    {
      title: "Governemnt support",
    },
    {
      title: "Investment support",
    },
    {
      title: "Date of starting commercial explotation",
      type: "Date",
    },
    {
      title: "Date of creation",
      type: "Date",
    },
    {
      title: "Country",
    },
    {
      title: "Region",
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
      type: "Date",
    },
    {
      title: "End date of creation",
      type: "Date",
    },
    {
      title: "Amount of energy in MWh",
      type: "number",
    },
    {
      title: "Stations",
      options: [],
      isSelect: true,
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

const ModalSection = ({ btnText, keyWord }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [error, setError] = useState({});

  useEffect(() => {
    if (keyWord === "EAC") {
      (async () => {
        const res = await getStation();
        const toSelectData = res.map((i) => ({
          value: i.name,
          label: i.name,
        }));
        const idx = InputsData["EAC"].findIndex((i) => i.title === "Stations");

        InputsData["EAC"][idx].options = toSelectData;
        console.log(InputsData["EAC"]);
      })();
    }
  }, [keyWord]);

  const dataRef = useRef(
    InputsData[keyWord].reduce((acc, i) => ({ ...acc, [i.title]: "" }), {})
  );

  const handleSubmit = async (data, keyWord, inputsData) => {
    const requiredFilds = inputsData[keyWord]
      .filter((i) => i.required)
      .map((i) => i.title)
      .filter((i) => data[i] === "");

    if (requiredFilds.length) {
      setError(requiredFilds.reduce((acc, i) => ({ ...acc, [i]: true }), {}));
      return;
    }

    const mapOfBackendCalls = {
      Station: createStation,
      Company: createOrganisation,
    };

    const payload = {
      Company: {
        name: data["Organization Name"],
        registryNumber: data["Trade Registry Company number"],
        businessType: data["Business type"],
        signatoryAddress: data["Signatory Address"],
        signatoryTelephone: data["Signatory Telephone"],
        organizationAddress: data["Organization Address"],
        signatoryFullName: data["Signatory Full Name"],
        signatoryEmail: data["Signatory Email"],
      },
      Station: {
        name: data["Facility name"],
        stationEnergyType: data["Device type"],
        placement: data["Station placement"],
        supportGovernment: data["Governemnt support"],
        supportInvestment: data["Investment support"],
        creationStart: new Date(data["Date of creation"]),
        exploitationStart: new Date(
          data["Date of starting commercial explotation"]
        ),
        countryId: data["Country"],
        regionId: data["Region"],
        organisation: window.organisation,
      },
      EAC: {
        startDate: data["Start date of creation"],
        endDate: data["End date of creation"],
        generatedEnergy: +data["Amount of energy in MWh"],
        station: data["Stations"],
        organisation: window.organisation,
      },
    };

    const res = await mapOfBackendCalls[keyWord](payload[keyWord]);
    console.log(res);
  };

  return (
    <>
      <CreateButton
        text={btnText}
        onClick={handleOpen}
        disabled={
          (keyWord === "Company" && !window.organisation) ||
          !window.walletConnection.isSignedIn()
        }
      />
      <CustomizedModal open={open} handleClose={handleClose}>
        <Grid container sx={TitleContainerStyle}>
          <TitleText title={btnText} />
          <RegularText
            content={`Please enter ${keyWord} info`}
            variant="small"
          />
        </Grid>
        <Grid container rowGap={"13px"} columnGap={"25px"}>
          {InputsData[keyWord].map((i, idx) => {
            return (
              <CustomizedInput
                labelName={i.title}
                required={i?.required}
                key={i.title}
                error={error[i.title]}
                isSelect={i.isSelect}
                options={i?.options ?? []}
                type={i.type}
                passUpValue={(value) => {
                  const payload = {
                    [i.title]: value,
                  };
                  dataRef.current = { ...dataRef.current, ...payload };
                }}
              />
            );
          })}
        </Grid>
        <Grid container sx={BtnContainerWrapperStyle}>
          <Grid item sx={BtnContainerStyle}>
            <CreateButton
              text="Submit"
              onClick={() => handleSubmit(dataRef.current, keyWord, InputsData)}
            />
          </Grid>
        </Grid>
      </CustomizedModal>
    </>
  );
};

export default ModalSection;
