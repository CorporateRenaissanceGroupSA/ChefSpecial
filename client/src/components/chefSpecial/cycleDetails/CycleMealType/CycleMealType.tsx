import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ListItemText,
  SelectChangeEvent,
} from "@mui/material";

export interface Option {
  Id: number;
  name: string;
}

interface cycleMealTypeProps {
  label?: string;
  options: Option[];
  selected: number[];
  setSelected: (selected: number[]) => void;
  hospitalId: number | null;
}

const CycleMealType: React.FC<cycleMealTypeProps> = ({
  label = "Meal Types",
  options,
  selected,
  setSelected,
  hospitalId,
}) => {
  console.log(options)
  const handleChange = (event: SelectChangeEvent<number[]>) => {
    const {
      target: { value },
    } = event;
    setSelected(
      typeof value === "string" ? value.split(",").map(Number) : (value as number[])
    );
  };

  return (
    <FormControl variant="filled" fullWidth disabled={hospitalId? false : true}>
      <InputLabel
      >
        {label}
      </InputLabel>
      <Select
        disableUnderline
        multiple
        value={selected}
        onChange={handleChange}
        renderValue={(selected) =>
          options
            .filter((option) => selected.includes(option.Id))
            .map((option) => option.name)
            .join(",")
        }
      >
        {options.map((option) => (
          <MenuItem key={option.Id} value={option.Id}>
            <ListItemText primary={option.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CycleMealType;
