import { Box, Grid } from "@mui/material";
import * as React from "react";
import { getOrganisations } from "../../api/api.service";
import CustomizedTable from "../../components/table/CustomizedTable";
import RegularText from "../../components/texts/RegularText";
import TitleText from "../../components/texts/TitleText";
import EacsTableCell from "./components/EacsTableCell";

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
  React.useEffect(() => {
    (async function () {
      const res = await getOrganisations(
        "ed25519:3Ns1T3Axq15unnELdLso8ebYhDT7ghzBQPrVyTcfovVLeY7UqCARNKecn49yiaL6NnAb7XjuwFjmRHaP7WqQNH7R"
      );
      console.log(res);
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
        bodyData={bodyData}
        renderCell={(el, idx) => (
          <EacsTableCell data={el} idx={idx} key={idx} />
        )}
      />
    </Box>
  );
};

export default MyEacs;
