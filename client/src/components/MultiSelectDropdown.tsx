import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
} from "@mui/material";

interface MultiSelectDropdownProps {
  label?: string;
  options: string[];
  selected: string[];
  setSelected: (selected: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label = "Select Meals",
  options,
  selected,
  setSelected,
}) => {

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setSelected(
      typeof value === "string" ? value.split(",") : (value as string[])
    );
  };

  return (
    <FormControl variant="standard" sx={{ width: 230 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={selected}
        onChange={handleChange}
        renderValue={(selected) => (selected as string[]).join(", ")}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultiSelectDropdown;
