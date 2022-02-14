import { Box, Grid } from "@mui/material";
import React from "react";
import CustomizedTable from "../../../components/table/CustomizedTable";
import RegularText from "../../../components/texts/RegularText";
import TitleText from "../../../components/texts/TitleText";

const SecondBoxStyle = {
  maxWidth: "605px",
  width: "100%",
  height: "100%",
  backgroundColor: "#fff",
  padding: "40px 43px 31px",
  maxHeight: "427px",
};

const TableContainerStyle = {
  "> div": {
    padding: "26px 0px 0px",
    boxShadow: "unset",
    "thead > tr": {
      backgroundColor: "#fff",
    },
  },
};

const DataSection = ({ title, matchingData, data }) => {
  return (
    <Box sx={SecondBoxStyle}>
      <TitleText title={title} />
      <RegularText content={`${matchingData} matching`} />
      <Grid sx={TableContainerStyle}>
        <CustomizedTable headData={data} />
      </Grid>
    </Box>
  );
};

export default DataSection;
