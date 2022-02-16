import { allCountries } from "country-region-data";
import { Contract } from "near-api-js";
import {
  createNFT,
  createOrganisation,
  createStation,
  getMeasurments,
} from "../../../api/api.service";
import { InputsData } from "./constants";

export const passUpValueCallback = async (
  value,
  currentIterable,
  localDataRefereance,
  keyWord,
  setData,
  eacMintType,
  setDisableSubmitBtn
) => {
  const payload = {
    [currentIterable.title]: value,
  };
  localDataRefereance.current = { ...localDataRefereance.current, ...payload };
  if (currentIterable.title === "Country") {
    const idx = InputsData[keyWord].findIndex((i) => i.title === "Region");
    InputsData[keyWord][idx].options = allCountries[value][2].map((i, idx) => ({
      value: idx,
      label: i[0],
    }));
    setData((prev) => ({ ...prev, ...InputsData }));
  }
  if (currentIterable.title === "Stations" && eacMintType === "Automatically") {
    const res = await getMeasurments(localStorage.organization, value);
    console.log(res);
    if (res && !res.length) return setDisableSubmitBtn(true);
    if (res && res.length) {
      // const resMock = [
      //   {
      //     startDate: "2/20/2022",
      //     endDate: "3/5/2022",
      //     generatedEnergy: 1500,
      //     station: "Station1",
      //     organisation: "1",
      //   },
      //   {
      //     startDate: "1/2/2022",
      //     endDate: "2/2/2022",
      //     generatedEnergy: 1500,
      //     station: "Station1",
      //     organisation: "1",
      //   },
      // ];
      res.sort((a, b) => {
        console.log(new Date(a.startDate), new Date(b.startDate));
        return new Date(a.startDate) - new Date(b.startDate);
      });
      const amountTotal = res.reduce((acc, i) => (acc += i.generatedEnergy), 0);
      const startDate = new Date(res[0].startDate).toISOString().split("T")[0];
      const endDate = new Date(res[res.length - 1].endDate)
        .toISOString()
        .split("T")[0];
      const EACTotal = {
        "Start date of creation": startDate,
        "End date of creation": endDate,
        "Amount of energy in MWh": amountTotal,
      };

      const filtered = InputsData[keyWord].map((i) => {
        if (i.default === "") {
          return { ...i, default: EACTotal[i.title] };
        }
        return i;
      });
      setData((prev) => {
        return {
          ...prev,
          [keyWord]: filtered,
        };
      });
    }
  }
};

export const handleSubmit = async (
  data,
  keyWord,
  inputsData,
  setError,
  clientInstance,
  setDisabled,
  handleClose,
  setInfoModalIsOpen,
  setInfoType,
  getAndTransformToSelectStations
) => {
  const requiredFilds = inputsData[keyWord]
    .filter((i) => i.required)
    .map((i) => i.title)
    .filter((i) => data[i] === "");
  console.log(requiredFilds);

  if (requiredFilds.length) {
    setError(requiredFilds.reduce((acc, i) => ({ ...acc, [i]: true }), {}));
    return;
  }

  const mapOfBackendCalls = {
    Station: createStation,
    Company: createOrganisation,
    EAC: createNFT,
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
      owner: window.walletConnection.getAccountId(),
      metadata: {
        title: "test",
        extra: JSON.stringify({
          startDate: new Date(data["Start date of creation"]),
          endDate: new Date(data["End date of creation"]),
          generatedEnergy: +data["Amount of energy in MWh"],
          station: data["Stations"],
          organisation: localStorage.organisation,
        }),
      },
    },
  };

  try {
    const res = await mapOfBackendCalls[keyWord](
      payload[keyWord],
      clientInstance
    );

    if (res) {
      if (keyWord === "Company") {
        localStorage.setItem("organisation", res.registryNumber);
        setDisabled(true);
      }
      if (keyWord === "Station") {
        getAndTransformToSelectStations();
      }
      setInfoType({ type: "success" });
    }
  } catch (e) {
    let message = `Something went wrong during creation ${keyWord}`;
    if (e.data?.statusCode === 422) {
      message = `${keyWord} with the name ${payload[keyWord].name} is already exist`;
    }
    setInfoType({ type: "error", msg: message });
  } finally {
    handleClose();
    setInfoModalIsOpen(true);
  }
};
