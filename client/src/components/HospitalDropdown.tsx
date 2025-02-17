import React, { useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, MenuItem, Select, InputLabel } from "@mui/material";
import { Hospitals } from "../types";

const inputFieldTheme = (theme: any) =>
  createTheme({
    ...theme,
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
            top: "-3px !important",
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            paddingBottom: "2px",
            paddingTop: "11px",
            fontSize: "14px",
          },
        },
      },
    },
  });

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
          <InputLabel>Hospital</InputLabel>
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={hospitalId ?? 0}
            onChange={(e) => setHospitalId(Number(e.target.value))}
            fullWidth
            disableUnderline
            label="Hospital"
            defaultValue={0}
          >
            <MenuItem disabled value={0}>
              <em>Select Hospital</em>
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

export default HospitalDropdown;
