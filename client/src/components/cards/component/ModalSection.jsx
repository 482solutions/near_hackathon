import { Grid } from "@mui/material";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { getStation } from "../../../api/api.service";
import CreateButton from "../../buttons/CreateButton";
import CustomizedInput from "../../inputs/CustomizedInput";
import CustomizedModal from "../../modal/CustomizedModal";
import RegularText from "../../texts/RegularText";
import TitleText from "../../texts/TitleText";
import InfoModal from "../../modal/info-modal/InfoModal";
import { useLocation, useNavigate } from "react-router-dom";
import useIpfs from "../../../hooks/useIpfs.hook";
import { InputsData } from "./constants";
import { handleSubmit, passUpValueCallback } from "./modal.utils";
import CustomizedToggleButton from "../../buttons/CustomizedToggleButton";

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

const ModalSection = ({ btnText, keyWord, img, stationData }) => {
  const [open, setOpen] = useState(false);
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);
  const [error, setError] = useState({});
  const [disabled, setDisabled] = useState(
    ((!localStorage.getItem("organisation") ||
      localStorage.getItem("organisation") === "undefined") &&
      (keyWord === "EAC" || keyWord === "Station")) ||
      (localStorage.getItem("organisation") &&
        localStorage.getItem("organisation") !== "undefined" &&
        keyWord === "Company") ||
      !window.walletConnection.isSignedIn()
  );
  const [data, setData] = useState(InputsData);
  const [infoType, setInfoType] = useState({ type: "success", msg: "" });
  const location = useLocation();
  const navigate = useNavigate();
  const { client } = useIpfs();
  const initDataRef = InputsData[keyWord].reduce(
    (acc, i) => ({ ...acc, [i.title]: "" }),
    {}
  );
  const dataRef = useRef(initDataRef);
  const [toggleValue, setTogglevalue] = useState("Manually");
  const [resetData, setResetData] = useState(false);
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState();

  useEffect(() => {
    if (location.state?.nextModal) {
      if (location.state?.nextModal === keyWord) {
        setOpen(true);
        navigate("/dashboard", {
          replace: { ...location, state: null },
        });
        setDisabled(false);
      }
    }
  }, [location.state?.nextModal, navigate]);

  const getAndTransformToSelectStations = useCallback(async () => {
    const res = await getStation();
    stationData.current = res;
    if (res && res.length) {
      const toSelectData = res.map((i) => ({
        value: i.name,
        label: i.name,
      }));
      const idx = InputsData["EAC"].findIndex((i) => i.title === "Stations");

      InputsData["EAC"][idx].options = toSelectData;
    }
  }, [stationData]);

  useEffect(() => {
    (async () => {
      if (keyWord === "EAC") {
        console.log("Asd");
        await getAndTransformToSelectStations();
      }
    })();
  }, [keyWord]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setError({});
    dataRef.current = Object.keys(dataRef.current).reduce(
      (acc, i) => ({ ...acc, [i]: "" }),
      {}
    );
  };

  const clearDatas = () => {
    dataRef.current = initDataRef;
    setError({});
    setData(InputsData);
    setDisableSubmitBtn(false);
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
        {keyWord === "EAC" && (
          <Grid container sx={{ marginBottom: "16px" }}>
            <CustomizedToggleButton
              toggleData={["Manually", "Automatically"].map((i) => ({
                value: i,
                label: i,
              }))}
              passUpToggleValue={(value) => {
                setTogglevalue(value);
                setResetData((prev) => !prev);
                clearDatas();
              }}
            />
          </Grid>
        )}
        <Grid container rowGap={"13px"} columnGap={"25px"}>
          {data[keyWord].map((i, idx) => {
            return (
              <CustomizedInput
                labelName={i.title}
                required={i?.required}
                key={idx}
                error={error[i.title]}
                isSelect={i.isSelect}
                options={i?.options || []}
                resetData={resetData}
                initialValue={i?.default ?? ""}
                type={i.type}
                minValue={
                  i.title === "End date of creation" ? minDate : undefined
                }
                disabled={
                  (i.title === "Region" && !dataRef.current?.["Country"]) ||
                  (i.title !== "Stations" && toggleValue === "Automatically")
                }
                passUpValue={(value) =>
                  passUpValueCallback(
                    value,
                    i,
                    dataRef,
                    keyWord,
                    setData,
                    toggleValue,
                    setDisableSubmitBtn,
                    clearDatas,
                    setMinDate
                  )
                }
              />
            );
          })}
        </Grid>
        <Grid container sx={BtnContainerWrapperStyle}>
          <Grid item sx={BtnContainerStyle}>
            <CreateButton
              text="Submit"
              disabled={disableSubmitBtn}
              loading={loading}
              onClick={() =>
                handleSubmit(
                  dataRef.current,
                  keyWord,
                  InputsData,
                  setError,
                  client,
                  setDisabled,
                  handleClose,
                  setInfoModalIsOpen,
                  setInfoType,
                  getAndTransformToSelectStations,
                  setLoading,
                  toggleValue,
                  stationData
                )
              }
            />
          </Grid>
        </Grid>
      </CustomizedModal>
      <InfoModal
        open={infoModalIsOpen}
        setOpen={setInfoModalIsOpen}
        infoType={infoType}
        img={img}
        keyWord={keyWord}
      />
    </>
  );
};

export default ModalSection;
