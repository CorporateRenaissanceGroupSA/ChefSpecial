import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableHead,
  Paper,
  TableCell,
  Button,
  tableCellClasses,
  TablePagination,
  TextField,
  Switch,
  Box,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl
} from "@mui/material";
import type { DatePickerProps } from "antd";
import { DatePicker, Space } from "antd";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import WysiwygModal from "../WysiwygModal/WysiwygModal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, {Dayjs} from "dayjs";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#F6F6F6",
    color: "#656565",
    borderBottom: "none",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "& td": {
    borderBottom: "1px solid #F1F1F1",
  },
}));

const AlertsTable = () => {
  const [rows, setRows] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const [scheduledTime, setScheduledTime] = useState(dayjs());
  const [repeatOptions, setRepeatOptions] = useState({
    daily: false,
    monthly: false,
    annually: false,
  });

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatOptions({
      ...repeatOptions,
      [event.target.name]: event.target.checked,
    });
  };



  const handleAddRow = () => {
    setRows([...rows, { id: Date.now(), text: "", date: null, active: false }]);
  };

  const handleInputChange = (id: number, field: string, value: string | boolean | Dayjs) => {
    // setScheduledTime(value)
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSaveRow = (id: number) => {
    console.log(
      "Saving row:",
      rows.find((row) => row.id === id)
    );
    setEditRowId(null);
  };

  return (
    <div className="px-3">
      <Paper
        sx={{
          width: "100%",
          boxShadow: "none",
          overflow: "hidden",
          borderRadius: "5px",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{ marginTop: 2, maxHeight: "78vh" }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
                  Alert
                </StyledTableCell>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
                  Scheduled Time
                </StyledTableCell>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
                  Repeat
                </StyledTableCell>
                <StyledTableCell width="5%" sx={{ fontFamily: "Poppins" }}>
                  Active
                </StyledTableCell>
                <StyledTableCell width="5%" sx={{ fontFamily: "Poppins" }}>
                  Actions
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell>
                    <TextField
                      value={row.text}
                      onClick={() => {
                        setModalOpen(true);
                        setEditRowId(row.id);
                      }}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopTimePicker
                        className="dateInput"
                        value={dayjs(
                          `2022-04-17T${
                            editedTime[meal.Id] || meal.mealTypeTime
                          }`
                        )}
                        onChange={(newTime) =>
                          handleInputChange(row.id, "date", date)
                        }
                      />
                    </LocalizationProvider> */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        value={scheduledTime}
                        onChange={(newValue) => {
                          setScheduledTime(newValue);
                          handleInputChange(row.id, "date", newValue);
                        }}
                        // renderInput={(params: any) => (
                        //   <TextField {...params} size="small" fullWidth />
                        // )}
                      />
                    </LocalizationProvider>
                    {/* <DatePicker
                      showTime
                      value={row.date}
                      onChange={(date) =>
                        handleInputChange(row.id, "date", date)
                      }
                    /> */}
                  </StyledTableCell>
                  <StyledTableCell>
                    <FormControl>
                      <RadioGroup row name="repeat">
                        <FormControlLabel
                          control={
                            <Radio
                              checked={repeatOptions.daily}
                              onChange={handleCheckboxChange}
                              name="daily"
                              value={0}
                            />
                          }
                          label="Daily"
                        />
                        <FormControlLabel
                          control={
                            <Radio
                              checked={repeatOptions.monthly}
                              onChange={handleCheckboxChange}
                              name="monthly"
                              value={1}
                            />
                          }
                          label="Monthly"
                        />
                        <FormControlLabel
                          control={
                            <Radio
                              checked={repeatOptions.annually}
                              onChange={handleCheckboxChange}
                              name="annually"
                              value={2}
                            />
                          }
                          label="Annually"
                        />
                      </RadioGroup>
                    </FormControl>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Switch
                      checked={row.active}
                      onChange={(e) =>
                        handleInputChange(row.id, "active", e.target.checked)
                      }
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#33cd33",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "#33cd33",
                          },
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    {editRowId === row.id && (
                      <Button
                        color="success"
                        variant="contained"
                        size="small"
                        onClick={() => handleSaveRow(row.id)}
                      >
                        Save
                      </Button>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box>
          <caption style={{ paddingTop: "3px" }}>
            <Button
              color="success"
              onClick={handleAddRow}
              sx={{
                minWidth: "37px",
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              <PlusCircleIcon className="size-6 text-[#FFB600]" />
            </Button>
          </caption>
        </Box>
      </Paper>
      <WysiwygModal
        open={modalOpen}
        setOpen={setModalOpen}
        setContent={(content) => {
          setEditorContent(content);
          if (editRowId) handleInputChange(editRowId, "text", content);
        }}
      />
    </div>
  );
};

export default AlertsTable;
