import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import { Meal, Option } from "../../../types";

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
    fontFamily: "Poppins",
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
  allMeals: Meal[];
  selectedMeal: Meal | null;
  onChange: (newMeal: Meal | null) => void;
  mealTypeId: number;
}

// utility function to convert Meal data to Option data
function mealToOption(meal: Meal | null): Option | null {
  if (meal && meal.Id !== 0 && meal.name) {
    return {
      value: meal.Id,
      label: meal.name,
    };
  }
  return null;
}
// utility function to convert Option data to Meal data
function optionToMeal(option: Option | null): Meal | null {
  if (!option || option.value === 0) {
    return null;
  } else {
    return {
      Id: option.value,
      name: option.label,
      description: "",
      mealTypeId: 0,
      servedId: 0,
      isActive: true
    };
  }
}

const MealDropdown: React.FC<MealDropdownProps> = ({
  allMeals,
  selectedMeal,
  onChange,
  mealTypeId,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
useEffect(() => {
  console.log("Selected Option:", selectedOption);
  console.log("Available Options:", options);
}, [selectedOption, options]);

  // convert meals to options every time allMeals changes
  useEffect(() => {
    const filteredOptions = allMeals
      .filter((meal) => meal.mealTypeId === mealTypeId && meal.isActive === true) // Filter by mealTypeId & active items
      .map((meal) => mealToOption(meal))
      .filter((option): option is Option => option !== null); // Ensure no null values

    console.log(
      `Filtered Meal options for mealTypeId ${mealTypeId}:`,
      filteredOptions
    );
    setOptions(filteredOptions);
  }, [allMeals, mealTypeId]);

  // convert selectedMeal to Option and set as selected option every time selectedMeal changes
  useEffect(() => {
    setSelectedOption(mealToOption(selectedMeal));
  }, [selectedMeal]);

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={(selectedOption: SingleValue<Option>) => {
        setSelectedOption(selectedOption); // Update local state
        onChange(optionToMeal(selectedOption)); // Notify parent
      }}
      styles={customStyles}
      menuPortalTarget={document.body} // Render dropdown menu outside of the table
      menuPosition="fixed" // Ensure proper positioning
      placeholder="Choose Meal"
      isClearable
    />
  );
};

export default MealDropdown;
