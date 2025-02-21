import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import Creatable from "react-select/creatable";
import { components, GroupBase } from "react-select";
import { Modal, TextField, Box } from "@mui/material";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { CustomButton } from "../../../Global/CustomButton";

export interface SelectOption {
  value: string;
  label: string;
}

const Label = styled.label.withConfig({
  shouldForwardProp: (prop) => prop !== "isFloating",
})<{ isFloating?: boolean }>`
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
  const { children, selectProps, isFocused } = props;
   const hasValue = selectProps.value?.label || selectProps.inputValue;

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
  options: SelectOption[];
  value: SelectOption | null;
  setEditCycleName: (editCycleName: boolean) => void;
  onChange: (value: SelectOption | null) => void;
  placeholder?: string;
  hospitalId: number | null;
  editCycleName: boolean;
  setEditedCycleName: (editedCycleName: string | null) => void;
}

const CreatableSelect: React.FC<CreatableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Cycle Name",
  hospitalId,
  editCycleName,
  setEditCycleName,
  setEditedCycleName,
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(value?.label || "");

  const handleChange = (newValue: SelectOption | null) => {
    console.log(newValue);
    onChange(newValue);
    if (newValue) setEditText(newValue.label.split(" (")[0]);
  };

  useEffect(() => {
    if (value) {
      console.log("Update value: ", value);
      setEditText(value.label)
    }
  }, [value]);

  const handleSaveEdit = () => {
    console.log("Value Label:", editText);

    if (value) {
      setEditCycleName(true);
      setEditedCycleName(editText);
      onChange({ value: value.value, label: editText });
    }
    setEditOpen(false);
  };
  return (
    <>
      <div style={{ position: "relative" }}>
        <Creatable<SelectOption, false, GroupBase<SelectOption>>
          className="col-span-2"
          inputId="select-input"
          options={options}
          isClearable
          value={value}
          onChange={handleChange}
          components={{ Control: CustomControl }}
          isDisabled={!hospitalId}
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
              display: "flex",
              alignItems: "center",
            }),
            input: (base) => ({
              ...base,
              margin: 0,
              paddingLeft: "3px",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#F6F6F6" : "#FFF",
              color: state.isSelected ? "black" : "black",
            }),
          }}
          placeholder={placeholder}
        />
        {value && (
          <PencilSquareIcon
            className="h-4 w-4 absolute right-[4.5rem] top-1/2 transform -translate-y-1/2 cursor-pointer text-[#ce962e]"
            onClick={() => setEditOpen(true)}
          />
        )}
      </div>

      {/* Edit Cycle Name Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "400px",
          }}
        >
          <h3 className="text-xl font-bold mb-2">Edit Cycle Name</h3>
          <TextField
            fullWidth
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            variant="outlined"
            size="small"
          />
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "end",
              gap: "10px",
            }}
          >
            <CustomButton
              color="success"
              variant="contained"
              size="small"
              onClick={handleSaveEdit}
            >
              Save
            </CustomButton>
            <CustomButton
              color="error"
              variant="outlined"
              size="small"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </CustomButton>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default CreatableSelect;
