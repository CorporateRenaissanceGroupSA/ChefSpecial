import React from "react";
import Creatable from "react-select/creatable";
import { components, GroupBase, Props } from "react-select";
import styled from "styled-components";

interface Option {
  value: string;
  label: string;
}

const Label = styled.label<{ isFloating?: boolean }>`
  position: absolute;
  top: ${(props) => (props.isFloating ? "5px" : "30%")};
  left: 10px;
  font-size: ${(props) => (props.isFloating ? "0.75rem" : "1rem")};
  color: #808080; 
  transition: all 0.2s ease-in-out;
  pointer-events: none;
  z-index: 1;
`;

// Custom Control component for react-select
const CustomControl = (props: any) => {
  const { children, selectProps, isFocused, hasValue } = props;
  return (
    <div style={{ position: "relative" }}>
      <Label isFloating={isFocused || hasValue}>
        {selectProps.placeholder}
      </Label>
      <components.Control {...props}>{children}</components.Control>
    </div>
  );
};

interface CreatableSelectProps {
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
}

const CreatableSelect: React.FC<CreatableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Cycle Name",
}) => {
  return (
    <Creatable<Option, false, GroupBase<Option>>
      className="col-span-2"
      options={options}
      value={value}
      onChange={onChange}
      components={{ Control: CustomControl }}
      isClearable
      styles={{
        control: (base, state) => ({
          ...base,
          boxShadow: "0 1px 4px 0px rgba(0, 0, 0, 0.16)",
          border: "none",
          borderLeft: state.isFocused
            ? "3px solid #FFB600"
            : "3px solid #FFB600",
          height: "56px",
          borderRadius: "5px",
          backgroundColor: "#F6F6F6",
          "&:hover": {
            borderLeftColor: "#FFB600",
          },
        }),
        container: (base, state) => ({
          ...base,
          position: "relative",
          border: "none",
        }),
        placeholder: (base) => ({
          ...base,
          display: "none",
        }),
        valueContainer: (base) => ({
          ...base,
          padding: "10px 6px",
          marginTop: "10px",
        }),
        input: (base) => ({
          ...base,
          margin: 0,
          paddingLeft: "3px"
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "#F6F6F6" : "#FFF",
          color: state.isSelected ? "black" : "black"    
        })
      }}
      placeholder={placeholder}
    />
  );
};

export default CreatableSelect;