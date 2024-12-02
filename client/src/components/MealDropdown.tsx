import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import { Meal, Option } from "../types";

interface MealDropdownProps {
  allMeals: Meal[];
  selectedMeal: Meal | null;
  onChange: (newMeal: Meal | null) => void;
}

// utility function to convert Meal data to Option data
function mealToOption(meal: Meal | null): Option | null {
  if (meal) {
    return {
      value: meal.Id,
      label: meal.name,
    };
  } else {
    return null;
  }
}
// utility function to convert Option data to Meal data
function optionToMeal(option: Option | null): Meal | null {
  if (!option || option.value === 0) {
    return null;
  } else {
    return {
      Id: option.value,
      name: option.label,
    };
  }
}

const MealDropdown: React.FC<MealDropdownProps> = ({
  allMeals,
  selectedMeal,
  onChange,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  // convert meals to options every time allMeals changes
  useEffect(() => {
    let newOptions: Option[] = [];
    allMeals.forEach((meal) => {
      let newOption = mealToOption(meal);
      if (newOption) {
        newOptions.push(newOption);
      }
    });
    console.log("All Meal options: ", newOptions);
    setOptions(newOptions);
  }, [allMeals]);

  // convert selectedMeal to Option and set as selected option every time selectedMeal changes
  useEffect(() => {
    setSelectedOption(mealToOption(selectedMeal));
  }, [selectedMeal]);

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={(selectedOption: SingleValue<Option>) =>
        onChange(optionToMeal(selectedOption))
      }
      isClearable
    />
  );
};

export default MealDropdown;
