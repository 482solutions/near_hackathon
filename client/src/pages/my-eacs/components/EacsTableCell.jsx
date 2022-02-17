import {
  Box,
  Button,
  Collapse,
  IconButton,
  TableRow,
  TableCell,
  Grid,
} from "@mui/material";
import React, { useEffect } from "react";
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
import { Contract } from "near-api-js";
import { useLocation } from "react-router-dom";

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
  "Certified Energy (MWh)",
  "Generation Start Date",
  "Device Type",
  "Certified by registry",
  "Generation Date",
  "Generation End Date",
];

export const BtnStyle = {
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
  const [isExchange, setIsExchange] = React.useState();

  useEffect(() => {
    (async () => {
      const contract = await new Contract(
        window.walletConnection.account(),
        `market.${process.env.REACT_APP_NFT_DEV_ACCOUNT_ID}`,
        {
          viewMethods: ["get_asks_by_owner_id"],
          changeMethods: [],
        }
      );
      const asks = await contract["get_asks_by_owner_id"]({
        account_id: window.accountId,
      });
      console.log("asks: ", asks);
      if (asks && asks.length) {
        const finded = asks.find((i) => i.token_id === data["id"]);
        if (finded) setIsExchange(true);
      }
    })();
  }, []);

  return (
    <>
      <TableRow>
        <TableCell>{data["id"]}</TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setIsOpen((prev) => !prev)}>
            <img
              src={ArrowIcon}
              alt="open-close control"
              style={isOpen ? { transform: "rotate(180deg)" } : undefined}
            />
          </IconButton>
        </TableCell>
        {Object.values(data)
          .slice(1, 6)
          .map((i, index) => {
            return (
              <TableCell key={i} sx={TableCellStyle}>
                {index === 4 && (
                  <span
                    style={
                      isExchange
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
                    defaultValue={
                      data[i] instanceof Date ? data[i].toDateString() : data[i]
                    }
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
        setIsModalOpen={setIsModalOpen}
        setIsExchange={setIsExchange}
        data={{
          "Creation time": data.Date.toDateString(),
          MWh: data.MWh,
          id: data.id,
          accountId: data["Device owner"],
          Facility: data["Facility name"],
        }}
      />
    </>
  );
};

export default EacsTableCell;
