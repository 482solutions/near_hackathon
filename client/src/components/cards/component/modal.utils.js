import { allCountries } from "country-region-data";
import { Contract } from "near-api-js";
import {
  createOrganisation,
  createStation,
  getMeasurmentByOrgAndStation,
} from "../../../api/api.service";
import { InputsData } from "./constants";

export const passUpValueCallback = async (
  value,
  currentIterable,
  localDataRefereance,
  keyWord,
  setData
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
  if (currentIterable.title === "Stations") {
    const res = await getMeasurmentByOrgAndStation(
      localStorage.getItem("organisation"),
      value
    );
    // if (true) {
    //   const resMock = [
    //     {
    //       startDate: "1/2/2022",
    //       endDate: "2/2/2022",
    //       generatedEnergy: 1500,
    //       station: "Station1",
    //       organisation: "1",
    //     },
    //     {
    //       startDate: "2/20/2022",
    //       endDate: "3/5/2022",
    //       generatedEnergy: 1500,
    //       station: "Station1",
    //       organisation: "1",
    //     },
    //   ];
    //   const amountTotal = resMock.reduce(
    //     (acc, i) => (acc += i.generatedEnergy),
    //     0
    //   );
    //   const startDate = new Date(resMock[0].startDate);
    //   const EACTotal = {
    //     "Start date of creation": `${startDate.getFullYear()}-${
    //       startDate.getMonth() + 1
    //     }-${startDate.getDay()}`,
    //     "End date of creation": new Date(resMock[resMock.length - 1].endDate),
    //     "Amount of energy in MWh": amountTotal,
    //   };

    //   InputsData[keyWord].forEach((i) => {
    //     if (i.default === "") {
    //       i.default = EACTotal[i.title];
    //     }
    //   });
    //   setData((prev) => ({
    //     ...prev,
    //     ...InputsData[keyWord],
    //   }));

    //   console.log("data", data);
    // }
  }
};

const handleEACCreation = async (payload, clientInstance) => {
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
