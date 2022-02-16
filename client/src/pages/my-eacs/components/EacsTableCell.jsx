import {
  Box,
  Button,
  Collapse,
  IconButton,
  TableRow,
  TableCell,
  Grid,
} from "@mui/material";
import React from "react";
import ArrowIcon from "../assets/arrow-icon.svg";
import SolarImg from "../assets/solar-station.svg";
import WindImg from "../assets/wind-station.svg";
import ThermoImg from "../assets/thermo-station.svg";
import GaseousImg from "../assets/gaseous-station.svg";
import LiquidImg from "../assets/liquid-station.svg";
import HydroImg from "../../dashboard/components/assets/hydroStationImg.svg";

import { TableCellStyle } from "../MyEacs";
import CellsModalSection from "./CellsModalSection";
import CustomizedReadInput from "../../../components/inputs/CustomizedReadInput";

const mapStations = {
  Solar: SolarImg,
  Wind: WindImg,
  Thermo: ThermoImg,
  Hydro: HydroImg,
  Gaseous: GaseousImg,
  Liquid: LiquidImg,
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
              {i instanceof Date ? i.toDateString() : i}
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
            }}
          >
            <Box
              sx={{
                maxWidth: "140px",
                width: "140px",
                maxHeight: "107px",
                marginRight: "76px",
                display: "inline-block",
                float: "left",
              }}
            >
              <img
                src={mapStations[data["Device Type"]]}
                alt="station"
                style={{ width: "100%", height: "100%" }}
              />
            </Box>

            {deviceData.map((i, idx) => {
              return (
                <Grid
                  sx={{
                    maxWidth: "198px",
                    display: "inline-flex",
                    marginRight: "27px",
                    marginBottom: "41px",
                  }}
                  key={idx}
                >
                  <CustomizedReadInput
                    labelName={i}
                    disabled
                    adornMent={i === "Certified" ? "MWh" : undefined}
                  />
                </Grid>
              );
            })}
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
