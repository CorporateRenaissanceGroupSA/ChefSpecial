import React from "react";
import Select, { SingleValue } from "react-select";
import { options } from "./MealTable";
import { Option } from "../types";

const customStyles = {
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
    "&:hover": {
      backgroundColor: "#656565",
    },
  }),
  control: (base: any, state: any) => ({
    ...base,
    border: "none",
    color: "#656565",
    borderColor: state.isFocused ? "#656565" : "#ccc",
    "&:hover": {},
    fontFamily: "Poppins"
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    borderLeft: "none",
    fiil: "#656565",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base: any, state: any) => ({
    ...base,
    color: state.isFocused ? "#656565" : "#656565", // Chevron color
    "&:hover": {
      color: "#656565", // Chevron color on hover
    },
  }),
};

interface MealDropdownProps {
  value: Option | null;
  onChange: (selectedOption: Option | null) => void;
}

const MealDropdown: React.FC<MealDropdownProps> = ({ value, onChange }) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={(selectedOption: SingleValue<Option>) =>
        onChange(selectedOption)
      }
      styles={customStyles}
      menuPortalTarget={document.body} // Render dropdown menu outside of the table
      menuPosition="fixed" // Ensure proper positioning
      placeholder="Choose Meal"
      isClearable
    />
  );
};

export default MealDropdown;
