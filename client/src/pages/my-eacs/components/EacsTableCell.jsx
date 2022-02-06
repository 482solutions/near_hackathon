import {
  Box,
  Button,
  Collapse,
  IconButton,
  TableRow,
  TableCell,
  Typography,
  Grid,
  TextField,
  FormLabel,
  InputLabel,
} from "@mui/material";
import React from "react";
import ArrowIcon from "../assets/arrow-icon.svg";
import SolarImg from "../assets/solar-station.svg";
import WindImg from "../assets/wind-station.svg";
import ThermoImg from "../assets/thermo-station.svg";
import HydroImg from "../../dashboard/components/assets/hydroStationImg.svg";

import { TableCellStyle } from "../MyEacs";
import CellsModalSection from "./CellsModalSection";
import CustomizedReadInput from "../../../components/inputs/CustomizedReadInput";

const mapStations = {
  Solar: SolarImg,
  Wind: WindImg,
  Thermo: ThermoImg,
  Hydro: HydroImg,
};

const deviceData = [
  "Device owner",
  "Certificate ID",
  "Certified",
  "Facility name",
  "Certified Energy  (MWh)",
  "Generation Start Date",
  "Device Type",
  "Certified by registry",
  "Generation Date",
  "Generation End Date",
];

const BtnStyle = {
  backgroundColor: "#14D9C1",
  borderRadius: "4px",
  fontSize: "12px",
  maxWidth: "60px",
  maxHeight: "30px",
  width: "100%",
  height: "100%",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#0FCCCE",
  },
};

const DotStyle = {
  height: "8px",
  width: "8px",
  backgroundColor: "#14D9C1",
  borderRadius: "50%",
  display: "inline-block",
};

const CollapseContentSytle = {
  "> div > div": {
    display: "grid",
    gridTemplateAreas: `
                            "img a a"
                            "img a a"
                            "b b b"
        `,
    gridGap: "38px",
    gridColumnGap: "85px",
  },
};

const EacsTableCell = ({ data, idx }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <TableRow>
        <TableCell>{idx + 1}</TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setIsOpen((prev) => !prev)}>
            <img
              src={ArrowIcon}
              alt="open-close control"
              style={isOpen ? { transform: "rotate(180deg)" } : undefined}
            />
          </IconButton>
        </TableCell>
        {Object.values(data).map((i, index) => {
          return (
            <TableCell key={i} sx={TableCellStyle}>
              {index === 4 && (
                <span
                  style={
                    i === "Exchange"
                      ? DotStyle
                      : {
                          ...DotStyle,
                          backgroundColor: "rgba(103, 103, 103, 0.3)",
                        }
                  }
                ></span>
              )}{" "}
              {i}
            </TableCell>
          );
        })}
        <TableCell>
          <Button onClick={() => setIsModalOpen(true)} sx={BtnStyle}>
            + Sale
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse
            in={isOpen}
            timeout="auto"
            unmountOnExit
            collapsedSize={"300px 0px"}
            sx={{
              paddingTop: "58px",
              paddingBottom: "32px",
              ...CollapseContentSytle,
            }}
          >
            <Box
              sx={{
                maxWidth: "140px",
                width: "140px",
                maxHeight: "107px",
                gridArea: "img",
              }}
            >
              <img
                src={mapStations[data["Device Type"]]}
                alt="station"
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
            <Grid container gap={"41px"} sx={{ gridArea: "a" }}>
              {deviceData.slice(0, 6).map((i, idx) => {
                return (
                  <Grid sx={{ maxWidth: "198px" }} key={idx}>
                    <CustomizedReadInput
                      labelName={i}
                      disabled
                      adornMent={i === "Certified" ? "MWh" : undefined}
                    />
                  </Grid>
                );
              })}
            </Grid>
            <Grid container gap={"41px"} sx={{ gridArea: "b" }}>
              {deviceData.slice(6).map((i, idx) => {
                return (
                  <Grid sx={{ maxWidth: "198px" }} key={idx}>
                    <CustomizedReadInput labelName={i} disabled />
                  </Grid>
                );
              })}
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
      <CellsModalSection
        isModalOpen={isModalOpen}
        id={idx + 1}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

export default EacsTableCell;
