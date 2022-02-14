import React, { useState } from "react";
import { createTheme, TextField, ThemeProvider } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterMoment";

const defaultMaterialTheme = createTheme({
  overrides: {
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: "#14D9C1",
      },
    },
    MuiPickersCalendarHeader: {
      switchHeader: {
        // backgroundColor: lightBlue.A200,
        // color: "white",
      },
    },
    MuiPickersDay: {
      day: {
        color: "#14D9C1",
      },
      daySelected: {
        backgroundColor: "#14D9C1",
      },
      dayDisabled: {
        color: "#14D9C1",
      },
      current: {
        color: "#14D9C1",
      },
    },
    MuiPickersModal: {
      dialogAction: {
        color: "#14D9C1",
      },
    },
  },
});

export const InputStyle = {
  boxSizing: "border-box",
  width: "100%",
  borderRadius: "4px",
  "> div": {
    border: "1px solid #676767",
    "&.Mui-focused": {
      border: "1px solid #0FC391 !important",
    },
    "&:hover": {
      border: "1px solid #676767",
    },
  },
  input: {
    boxSizing: "border-box",
    backgroundColor: "#FFFFFF",
    padding: "10px 13px",
    height: "36px",
    fontSize: "14px",
  },
  "input::placeholder": {
    color: "#676767",
    fontSize: "12px",
    lineHeight: "16px",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    display: "none",
  },
};

const CustomizedDatePicker = () => {
  const [selectedDate, handleDateChange] = useState(new Date());

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        okText=""
        renderInput={(params) => <TextField {...params} sx={InputStyle} />}
      />
    </LocalizationProvider>
  );
};

export default CustomizedDatePicker;
