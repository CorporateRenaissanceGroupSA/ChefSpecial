import React from "react";
import Select, { SingleValue } from "react-select";
import { options } from "./MealTable";
import { Option } from "../types";



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
      isClearable
    />
  );
};

export default MealDropdown;
