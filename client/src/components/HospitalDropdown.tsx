import React from "react";
import { Hospitals } from "../types";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, MenuItem, Select, InputLabel } from "@mui/material";

interface HospitalDropdownProps {
  hospitals: Hospitals[];
  hospitalId: number;
  setHospitalId: (id: number) => void;
}

const HospitalDropdown: React.FC<HospitalDropdownProps> = ({
  hospitals,
  hospitalId,
  setHospitalId,
}) => {
  return (
    <div>
      <ThemeProvider theme={inputFieldTheme}>
        <FormControl
          variant="filled"
          sx={{ minWidth: 190, position: "absolute", right: 0 }}
          size="small"
        >
          <InputLabel>Site</InputLabel>
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={hospitalId ?? ""}
            onChange={(e) => setHospitalId(Number(e.target.value))}
            fullWidth
            disableUnderline
            label="Site"
          >
            <MenuItem disabled value={0}>
              <em>Select Site</em>
            </MenuItem>
            {hospitals.map((option) => (
              <MenuItem key={option.Id} value={option.Id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ThemeProvider>
    </div>
  );
};

const inputFieldTheme = createTheme({
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: "5px !important",
          backgroundColor: "white !important",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily: "Poppins",
          top: "-7px !important",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        shrink: {
          top: "-3px !important",
          left: "-3px !important",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          paddingBottom: "2px",
          paddingTop: "11px",
          fontSize: "14px",
          paddingLeft: "9px",
          fontFamily: "Poppins",
        },
      },
    },
  },
});

export default HospitalDropdown;
