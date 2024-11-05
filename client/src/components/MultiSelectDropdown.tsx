import React from "react";
import { Listbox } from "@headlessui/react";

interface MultiSelectDropdownProps {
  selected: string[];
  setSelected: (selected: string[]) => void;
  options: string[];
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  selected,
  setSelected,
  options,
}) => {
  const toggleOption = (option: string) => {
    setSelected(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option]
    );
  };
  return (
    <Listbox as="div" className="relative">
      <Listbox.Button className="p-2 border rounded-lg">
        {selected.join(", ") || "Select Meal Types"}
      </Listbox.Button>
      <Listbox.Options className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg">
        {options.map((option) => (
          <Listbox.Option
            key={option}
            value={option}
            onClick={() => toggleOption(option)}
          >
            {({ selected }) => (
              <span className={`p-2 block ${selected ? "font-bold" : ""}`}>
                {option}
              </span>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  );
};

export default MultiSelectDropdown;
