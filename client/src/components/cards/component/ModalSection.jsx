import { Grid } from "@mui/material";
import { create } from "ipfs-http-client";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import {
  createOrganisation,
  createStation,
  getMeasurmentByOrgAndStation,
  getStation,
} from "../../../api/api.service";
import CreateButton from "../../buttons/CreateButton";
import CustomizedInput from "../../inputs/CustomizedInput";
import CustomizedModal from "../../modal/CustomizedModal";
import RegularText from "../../texts/RegularText";
import TitleText from "../../texts/TitleText";
import { Contract } from "near-api-js";
import { allCountries } from "country-region-data";
import InfoModal from "../../modal/info-modal/InfoModal";
import { useLocation, useNavigate } from "react-router-dom";
import useIpfs from "../../../hooks/useIpfs.hook";

const transformedToSelectCountries = allCountries.map((i, idx) => ({
  value: idx,
  label: i[0],
}));

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
      title: "Plant performance",
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
      isSelect: true,
      required: true,
      options: transformedToSelectCountries,
    },
    {
      title: "Region",
      isSelect: true,
      options: [],
      required: true,
    },
    {
      title: "Manufacturer Country",
      isSelect: true,
      required: true,
      options: transformedToSelectCountries,
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
      required: true,
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

const ModalSection = ({ btnText, keyWord, img }) => {
  const [open, setOpen] = useState(false);
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);
  const [error, setError] = useState({});
  const [disabled, setDisabled] = useState(
    (!localStorage.getItem("organisation") &&
      (keyWord === "EAC" || keyWord === "Station")) ||
      (localStorage.getItem("organisation") && keyWord === "Company") ||
      !window.walletConnection.isSignedIn()
  );
  const [data, setData] = useState(InputsData);
  const location = useLocation();
  const navigate = useNavigate();
  const { client } = useIpfs();

  useEffect(() => {
    if (location.state?.nextModal) {
      if (location.state?.nextModal === keyWord) {
        setOpen(true);
        navigate("/", {
          replace: { ...location, state: null },
        });
        setDisabled(false);
      }
    }
  }, [location.state?.nextModal, navigate]);

  const getAndTransformToSelectStations = useCallback(async () => {
    const res = await getStation();
    if (res && res.length) {
      const toSelectData = res.map((i) => ({
        value: i.name,
        label: i.name,
      }));
      const idx = InputsData["EAC"].findIndex((i) => i.title === "Stations");

      InputsData["EAC"][idx].options = toSelectData;
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (keyWord === "EAC") {
        await getAndTransformToSelectStations();
      }
    })();
  }, [keyWord, getAndTransformToSelectStations]);

  const dataRef = useRef(
    InputsData[keyWord].reduce((acc, i) => ({ ...acc, [i.title]: "" }), {})
  );

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    dataRef.current = Object.keys(dataRef.current).reduce(
      (acc, i) => ({ ...acc, [i]: "" }),
      {}
    );
  };

  const handleEACCreation = async (payload) => {
    const ipfsData = await client.add(JSON.stringify(payload));
    const contract = new Contract(
      window.walletConnection.account(),
      "dev-1644404282656-99413275182628",
      {
        viewMethods: ["getMessages"],
        changeMethods: ["create_ft"],
        sender: window.walletConnection.account(),
      }
    );

    const res = contract["create_ft"](
      { name: "token2", reference: ipfsData.path },
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
        plantPerformance: data["Plant performance"],
        governmentAid: data["Governemnt support"],
        investmentAid: data["Investment support"],
        manufactureDate: new Date(data["Date of creation"]),
        placement: "asd",
        exploitationStart: new Date(
          data["Date of starting commercial explotation"]
        ),
        countryId: +data["Country"],
        regionId: +data["Region"],
        manufacturerCountryId: +data["Manufacturer Country"],
        organisation: localStorage.organisation,
      },
      EAC: {
        startDate: data["Start date of creation"],
        endDate: data["End date of creation"],
        generatedEnergy: +data["Amount of energy in MWh"],
        station: +data["Stations"],
        organisation: localStorage.organisation,
      },
    };

    const res = await mapOfBackendCalls[keyWord](payload[keyWord]);
    if (res) {
      if (keyWord === "Company") {
        localStorage.setItem("organisation", res.registryNumber);
        setDisabled(true);
      }
      if (keyWord === "Station") {
        getAndTransformToSelectStations();
      }
      setOpen(false);
      setInfoModalIsOpen(true);
    }
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
          {data[keyWord].map((i, idx) => {
            return (
              <CustomizedInput
                labelName={i.title}
                required={i?.required}
                key={i.title}
                error={error[i.title]}
                isSelect={i.isSelect}
                options={i?.options || []}
                type={i.type}
                disabled={i.title === "Region" && !dataRef.current?.["Country"]}
                passUpValue={async (value) => {
                  const payload = {
                    [i.title]: value,
                  };
                  dataRef.current = { ...dataRef.current, ...payload };
                  if (i.title === "Country") {
                    const idx = InputsData[keyWord].findIndex(
                      (i) => i.title === "Region"
                    );
                    InputsData[keyWord][idx].options = allCountries[
                      value
                    ][2].map((i, idx) => ({ value: idx, label: i[0] }));
                    setData((prev) => ({ ...prev, ...InputsData }));
                  }
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
      <InfoModal
        open={infoModalIsOpen}
        setOpen={setInfoModalIsOpen}
        img={img}
        keyWord={keyWord}
      />
    </>
  );
};

export default ModalSection;
