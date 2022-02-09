import { Container, Modal, Typography, Box, Grid } from "@mui/material";
import { create } from "ipfs-http-client";
import React, { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { async } from "regenerator-runtime";
import {
  createMeasurment,
  createOrganisation,
  createStation,
  getMeasurmentByOrgAndStation,
  getStation,
} from "../../../api/api.service";
import Form from "../../../pages/dashboard/components/context/FormContext";
import CreateButton from "../../buttons/CreateButton";
import CustomizedInput from "../../inputs/CustomizedInput";
import CustomizedModal from "../../modal/CustomizedModal";
import RegularText from "../../texts/RegularText";
import TitleText from "../../texts/TitleText";
import { Contract } from "near-api-js";

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
      required: true,
    },
    {
      title: "Station placement",
      required: true,
    },
    {
      title: "Governemnt support",
      required: true,
    },
    {
      title: "Investment support",
      required: true,
    },
    {
      title: "Date of starting commercial explotation",
      type: "Date",
      required: true,
    },
    {
      title: "Date of creation",
      type: "Date",
      required: true,
    },
    {
      title: "Country",
      required: true,
    },
    {
      title: "Region",
      required: true,
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
      required: true,
    },
    {
      title: "End date of creation",
      type: "Date",
      required: true,
    },
    {
      title: "Amount of energy in MWh",
      type: "number",
      required: true,
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

let client;

const ModalSection = ({ btnText, keyWord }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [error, setError] = useState({});
  const [disabled, setDisabled] = useState(
    (localStorage.getItem("organisation") && keyWord === "Company") ||
      !window.walletConnection.isSignedIn()
  );

  const getAndTransformToSelectStations = useCallback(async () => {
    const res = await getStation();
    const toSelectData = res.map((i) => ({
      value: i.name,
      label: i.name,
    }));
    const idx = InputsData["EAC"].findIndex((i) => i.title === "Stations");

    InputsData["EAC"][idx].options = toSelectData;
  }, []);

  useEffect(() => {
    if (keyWord === "EAC") {
      getAndTransformToSelectStations();
    }
  }, [keyWord, getAndTransformToSelectStations]);
  const dataRef = useRef(
    InputsData[keyWord].reduce((acc, i) => ({ ...acc, [i.title]: "" }), {})
  );

  useEffect(() => {
    (async function () {
      client = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
      });
    })();
  }, []);

  const handleEACCreation = async (payload) => {
    console.log(payload);
    const ipfsData = await client.add(JSON.stringify(payload));
    const contract = new Contract(
      window.walletConnection.account(),
      "dev-1644404282656-99413275182628",
      {
        viewMethods: ["getMessages"], // view methods do not change state but usually return a value
        changeMethods: ["create_ft"], // change methods modify state
        sender: window.walletConnection.account(), // account object to initialize and sign transactions.
      }
    );

    const res = contract["create_ft"](
      { name: localStorage.organisation, reference: ipfsData.path },
      "300000000000000",
      "3000000000000000000000000"
    )
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

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
      EAC: handleEACCreation,
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
        organisation: localStorage.organisation,
      },
      EAC: {
        startDate: data["Start date of creation"],
        endDate: data["End date of creation"],
        generatedEnergy: +data["Amount of energy in MWh"],
        station: data["Stations"],
        organisation: localStorage.organisation,
      },
    };

    const res = await mapOfBackendCalls[keyWord](payload[keyWord]);
    if (res) {
      if (keyWord === "Company") {
        localStorage.setItem("organisation", res.name);
        setDisabled(true);
      }
      if (keyWord === "Station") {
        getAndTransformToSelectStations();
      }
      setOpen(false);
    }
    console.log(res);
    // dev - 1644404282656 - 99413275182628;
  };

  return (
    <>
      <CreateButton text={btnText} onClick={handleOpen} disabled={disabled} />
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
                passUpValue={async (value) => {
                  const payload = {
                    [i.title]: value,
                  };
                  dataRef.current = { ...dataRef.current, ...payload };
                  if (i.title === "Stations") {
                    const res = await getMeasurmentByOrgAndStation(
                      localStorage.getItem("organisation"),
                      value
                    );
                    if (res && res.length) {
                    }
                  }
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
