import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import React from "react";
import EacsTableCell from "../../pages/my-eacs/components/EacsTableCell";
import { TableCellStyle } from "../../pages/my-eacs/MyEacs";
import CustomizedLoader from "../loader/CustomizedLoader";

const TableContainerStyles = {
  padding: "56px",
  paddingTop: "80px",
  td: {
    paddingTop: "16px",
    paddingBottom: "16px",
  },
};

const TableHeadStyle = {
  background: "rgba(15, 184, 195, 0.06)",
};

const CustomizedTable = ({ headData, bodyData, renderCell }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  return (
    <>
      {!bodyData ? (
        <CustomizedLoader type="circle" />
      ) : (
        <TableContainer component={Paper} sx={TableContainerStyles}>
          <Table size="small">
            <TableHead>
              <TableRow sx={TableHeadStyle}>
                {headData.map((i) => {
                  return (
                    <TableCell key={i} sx={TableCellStyle}>
                      {i}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {bodyData?.length > 0 &&
                bodyData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((el, idx) => {
                    return renderCell(el, idx);
                  })}
            </TableBody>
          </Table>
          {
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={bodyData?.length ?? 0}
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
                svg: {
                  right: "-5px",
                },
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
          }
        </TableContainer>
      )}
    </>
  );
};

export default CustomizedTable;
