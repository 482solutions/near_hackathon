import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  IconButton,
  Button,
  Grid,
  TablePagination,
} from "@mui/material";
import { borderRadius } from "@mui/system";
import * as React from "react";
import { getOrganisations } from "../../api/api.service";
import CreateButton from "../../components/buttons/CreateButton";
import RegularText from "../../components/texts/RegularText";
import TitleText from "../../components/texts/TitleText";
import ArrowIcon from "./assets/arrow-icon.svg";

const BoxStyle = {
  padding: "0 56px",
  paddingTop: "43px",
  display: "flex",
  flexDirection: "column",
  gap: "49px",
};

const TableContainerStyles = {
  padding: "56px",
  paddingTop: "80px",
  td: {
    paddingTop: "16px",
    paddingBottom: "16px",
  },
};

const TableCellStyle = {
  fontWeight: 400,
  fontSize: "14px",
  color: "#3F4246",
};

const bodyData = [
  {
    "Device Type": "Solar",
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

const TableHeadStyle = {
  background: "rgba(15, 184, 195, 0.06)",
};

const DotStyle = {
  height: "8px",
  width: "8px",
  backgroundColor: "#14D9C1",
  borderRadius: "50%",
  display: "inline-block",
};

const MyEacs = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    (async function () {
      const res = await getOrganisations(
        "ed25519:3Ns1T3Axq15unnELdLso8ebYhDT7ghzBQPrVyTcfovVLeY7UqCARNKecn49yiaL6NnAb7XjuwFjmRHaP7WqQNH7R"
      );
      console.log(res);
    })();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box sx={BoxStyle}>
      <Grid>
        <TitleText title={"EACs"} />
        <RegularText content={"Manage your EACs"} />
      </Grid>
      <TableContainer component={Paper} sx={TableContainerStyles}>
        <Table size="small">
          <TableHead>
            <TableRow sx={TableHeadStyle}>
              {[
                "ID",
                "Info",
                "Device type",
                "Date",
                "Grid operator",
                "MWh",
                "Status",
                "Actions",
              ].map((i) => {
                return (
                  <TableCell key={i} sx={TableCellStyle}>
                    {i}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {bodyData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((el, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => setIsOpen((prev) => !prev)}
                      >
                        <img src={ArrowIcon} alt="open-close control" />
                      </IconButton>
                    </TableCell>
                    {Object.values(el).map((i, index) => {
                      return (
                        <TableCell key={i} sx={TableCellStyle}>
                          {index === 4 && (
                            <span
                              style={
                                i === "Exchange"
                                  ? DotStyle
                                  : {
                                      ...DotStyle,
                                      backgroundColor:
                                        "rgba(103, 103, 103, 0.3)",
                                    }
                              }
                            ></span>
                          )}{" "}
                          {i}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Button onClick={() => {}} sx={BtnStyle}>
                        + Sale
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={bodyData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          SelectProps={{
            MenuProps: {
              sx: {
                li: {
                  color: "rgba(103, 103, 103, 0.6)",
                  fontWeight: 400,
                  fontSize: "14px",
                },
              },
            },
          }}
          sx={{
            p: {
              color: "rgba(103, 103, 103, 0.6)",
              fontWeight: 400,
              fontSize: "16px",
            },
            "p:first-of-type, p:last-of-type": {
              fontSize: "14px",
            },
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default MyEacs;
