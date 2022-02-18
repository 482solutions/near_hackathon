import { allCountries } from "country-region-data";
import moment from "moment";
import { Contract } from "near-api-js";
import {
  createMeasurment,
  createNFT,
  createOrganisation,
  createStation,
  getMeasurments,
  getNFTs,
  getStation,
} from "../../../api/api.service";
import { InputsData } from "./constants";

let measurmentGlobal;
let stationGlobal;

function overlap(dateRanges) {
  var sortedRanges = dateRanges.sort((previous, current) => {
    // get the start date from previous and current
    var previousTime = previous.start.getTime();
    var currentTime = current.start.getTime();

    // if the previous is earlier than the current
    if (previousTime < currentTime) {
      return -1;
    }

    // if the previous time is the same as the current time
    if (previousTime === currentTime) {
      return 0;
    }

    // if the previous time is later than the current time
    return 1;
  });

  var result = sortedRanges.reduce(
    (result, current, idx, arr) => {
      // get the previous range
      if (idx === 0) {
        return result;
      }
      var previous = arr[idx - 1];

      // check for any overlap
      var previousEnd = previous.end.getTime();
      var currentStart = current.start.getTime();
      var overlap = previousEnd >= currentStart;

      // store the result
      if (overlap) {
        // yes, there is overlap
        result.overlap = true;
        // store the specific ranges that overlap
        result.ranges.push({
          previous: previous,
          current: current,
        });
      }

      return result;

      // seed the reduce
    },
    { overlap: false, ranges: [] }
  );

  // return the final results
  return result;
}

// var r1 = {
//   start: new Date("2/4/2001"),
//   end: new Date("7/1/2002")
// };

// var r2 = {
//   start: new Date("7/2/2002"),
//   end: new Date("2/4/2003")
// };

// // start date overlaps with end date of previous
// var r3 = {
//   start: new Date("8/2/2002"),
//   end: new Date("5/12/2002")
// };

// var ranges = [r1, r3, r2];

// var output = overlap(ranges);
// console.log(output);

export const passUpValueCallback = async (
  value,
  currentIterable,
  localDataRefereance,
  keyWord,
  setData,
  eacMintType,
  setDisableSubmitBtn,
  clearDatas,
  setMinDate
) => {
  const payload = {
    [currentIterable.title]: value,
  };
  localDataRefereance.current = { ...localDataRefereance.current, ...payload };
  if (currentIterable.title === "Start date of creation") {
    setMinDate(value);
  }
  if (currentIterable.title === "Country") {
    const idx = InputsData[keyWord].findIndex((i) => i.title === "Region");
    InputsData[keyWord][idx].options = allCountries[value][2].map((i, idx) => ({
      value: idx,
      label: i[0],
    }));
    setData((prev) => ({ ...prev, ...InputsData }));
  }
  if (currentIterable.title === "Stations" && eacMintType === "Automatically") {
    const res = await getMeasurments(
      localStorage.getItem("organisation"),
      value
    );
    measurmentGlobal = [...res];

    if (res && !res.length) {
      clearDatas();
      return setDisableSubmitBtn(false);
    }
    if (res && res.length) {
      setDisableSubmitBtn(false);
      // clearDatas();
      // const resMocka = [
      //   {
      //     id: 1,
      //     stationName: "test",
      //     stationOrganisationRegistryNumber: "43659632",
      //     startDate: "",
      //     endDate: "",
      //     generatedEnergy: 0,
      //     minted: false,
      //   },
      //   {
      //     id: 2,
      //     stationName: "test",
      //     stationOrganisationRegistryNumber: "43659632",
      //     startDate: "18.01.2021",
      //     endDate: "20.02.2021",
      //     generatedEnergy: 1444,
      //     minted: false,
      //   },
      // ];
      const filteredResponse = res.filter((i) => {
        return i.startDate || i.endDate;
      });
      filteredResponse.forEach((i) => {
        if (i.startDate) {
          const splited = i.startDate.split(".");
          i.startDate = new Date(+splited[2], splited[1] - 1, +splited[0]);
        }
        if (i.endDate) {
          const splited = i.endDate.split(".");
          i.endDate = new Date(+splited[2], splited[1] - 1, +splited[0]);
        }
      });

      filteredResponse.sort((a, b) => {
        return a.startDate - b.startDate;
      });

      const amountTotal = filteredResponse.reduce(
        (acc, i) => (acc += i.generatedEnergy),
        0
      );
      const startDate = filteredResponse[0].startDate
        .toISOString()
        .split("T")[0];
      const endDate = filteredResponse[filteredResponse.length - 1].endDate
        .toISOString()
        .split("T")[0];
      const EACTotal = {
        "Start date of creation": startDate,
        "End date of creation": endDate,
        "Amount of energy in MWh": amountTotal,
      };

      localDataRefereance.current = {
        ...localDataRefereance.current,
        ...EACTotal,
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
  getAndTransformToSelectStations,
  setLoading,
  toggleValue,
  stationData
) => {
  setLoading(true);
  console.log(keyWord, data);

  const requiredFilds = inputsData[keyWord]
    .filter((i) => i.required)
    .map((i) => i.title)
    .filter((i) => data[i] === "");

  if (requiredFilds.length) {
    setError(requiredFilds.reduce((acc, i) => ({ ...acc, [i]: true }), {}));
    setLoading(false);

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

  if (keyWord === "EAC") {
    const finded = stationData.current.find((i) => i.name === data["Stations"]);
    if (finded) {
      payload.EAC.metadata.extra = JSON.stringify({
        startDate: new Date(data["Start date of creation"]),
        endDate: new Date(data["End date of creation"]),
        generatedEnergy: +data["Amount of energy in MWh"],
        station: data["Stations"],
        organisation: localStorage.organisation,
        location: finded.countryId,
        deviceType: finded.stationEnergyType,
      });
    }
    const res = await getNFTs(window.accountId);
    const deviceInfo = res.map((i) => {
      const parsed = JSON.parse(i.metadata.extra);
      return { ...i, metadata: { ...i.metadata, extra: parsed } };
    });
    const filteredNFT = deviceInfo.filter((i) => {
      return i.metadata.extra.station === data["Stations"];
    });

    if (filteredNFT.length) {
      const isOverlap = filteredNFT.some((i) => {
        return (
          moment(data["Start date of creation"]).isBetween(
            i.metadata.extra.startDate.split("T")[0],
            i.metadata.extra.endDate.split("T")[0],
            null,
            []
          ) ||
          moment(data["End date of creation"]).isBetween(
            i.metadata.extra.startDate.split("T")[0],
            i.metadata.extra.endDate.split("T")[0],
            null,
            []
          ) ||
          moment(i.metadata.extra.startDate.split("T")[0]).isBetween(
            data["Start date of creation"],
            data["End date of creation"],
            null,
            []
          ) ||
          moment(i.metadata.extra.endDate.split("T")[0]).isBetween(
            data["Start date of creation"],
            data["End date of creation"],
            null,
            []
          )
        );
      });
      if (isOverlap) {
        setInfoType({
          type: "error",
          msg: "Dates are overalaped with already created EAC with this station",
        });
        handleClose();
        setInfoModalIsOpen(true);
        setLoading(false);
        return;
      }
    }
  }
  try {
    const res = await mapOfBackendCalls[keyWord](
      payload[keyWord],
      clientInstance
    );
    if (toggleValue === "Automatically") {
      await createMeasurment({ measurements: measurmentGlobal });
    }

    if (res) {
      if (keyWord === "Company") {
        localStorage.setItem("organisation", res.registryNumber);
        setDisabled(true);
      }
      if (keyWord === "Station") {
        await getAndTransformToSelectStations();
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
    setLoading(false);
  }
};
