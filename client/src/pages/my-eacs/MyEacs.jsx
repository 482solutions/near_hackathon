import { Box, Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useMemo } from "react";
import {
  getNFTs,
  getOrganisations,
  getStation,
  getStationByOrgAndStationName,
} from "../../api/api.service";
import CustomizedTable from "../../components/table/CustomizedTable";
import RegularText from "../../components/texts/RegularText";
import TitleText from "../../components/texts/TitleText";
import EacsTableCell from "./components/EacsTableCell";
import { allCountries } from "country-region-data";

const BoxStyle = {
  padding: "0 56px",
  paddingTop: "43px",
  display: "flex",
  flexDirection: "column",
  gap: "49px",
};

export const TableCellStyle = {
  fontWeight: 400,
  fontSize: "14px",
  color: "#3F4246",
};

const bodyData = [
  {
    "Device Type": "Hydro",
    Date: "01/02/2022",
    "Grid Operator": "Germany",
    MWh: "400",
    Status: "Exchange",
  },
  {
    "Device Type": "Thermo",
    Date: "01/02/2022",
    "Grid Operator": "Germany",
    MWh: "400",
    Status: "Exchange",
  },
  {
    "Device Type": "Wind",
    Date: "01/02/2022",
    "Grid Operator": "Germany",
    MWh: "400",
    Status: "Exchange",
  },
  {
    "Device Type": "Solar",
    Date: "01/02/2022",
    "Grid Operator": "Germany",
    MWh: "400",
    Status: "Archivated",
  },
];

const MyEacs = () => {
  const [eacs, setEacs] = useState();
  const [body, setBody] = useState();

  const transformedDataOfEacsToBodyData = useMemo(() => {
    if (!eacs) return null;
    (async () => {
      const deviceInfo = eacs.map((i) => {
        const parsed = JSON.parse(i.metadata.extra);
        return { ...i, metadata: { ...i.metadata, extra: parsed } };
      });

      let result = [];
      for await (let data of deviceInfo) {
        if (data.metadata.extra.organisation && data.metadata.extra.station) {
          try {
            const res = await getStationByOrgAndStationName(
              data.metadata.extra.organisation,
              data.metadata.extra.station
            );
            result.push({ ...data, stationInfo: res });
          } catch (e) {}
        }
      }
      setBody(
        result.map((i) => {
          console.log(i.metadata.issued_at);
          return {
            "Device Type": i.stationInfo.stationEnergyType,
            Date: i.metadata.extra.startDate,
            "Grid Operator": allCountries[i.stationInfo.countryId][0],
            MWh: i.metadata.extra.generatedEnergy,
            Status: "Exchange",
          };
        })
      );
    })();
    //  {
    //   "Device Type": "Solar",
    //   Date: "01/02/2022",
    //   "Grid Operator": "Germany",
    //   MWh: "400",
    //   Status: "Archivated",
    // },
  }, [eacs]);

  useEffect(() => {
    (async function () {
      const res = await getNFTs();
      if (res) {
        setEacs(res);
      }
    })();
  }, []);

  return (
    <Box sx={BoxStyle}>
      <Grid>
        <TitleText title={"EACs"} />
        <RegularText content={"Manage your EACs"} />
      </Grid>
      <CustomizedTable
        headData={[
          "ID",
          "Info",
          "Device type",
          "Date",
          "Grid operator",
          "MWh",
          "Status",
          "Actions",
        ]}
        bodyData={body}
        renderCell={(el, idx) => (
          <EacsTableCell data={el} idx={idx} key={idx} />
        )}
      />
    </Box>
  );
};

export default MyEacs;
