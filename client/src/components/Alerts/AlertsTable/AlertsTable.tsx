import React, { useState, useEffect } from "react";
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
  FormControl,
} from "@mui/material";
// import type { DatePickerProps } from "antd";
// import { DatePicker, Space } from "antd";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import WysiwygModal from "../WysiwygModal/WysiwygModal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { mergeNotes, getNotes } from "../../../utils/db-utils";
import { Notes } from "../../../types";
// import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import {
  ContentState,
  EditorState,
  convertFromHTML,
  convertFromRaw,
  convertToRaw,
} from "draft-js";

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

interface AlertsTableProps {
  hospitalId: number;
  userId: number;
}

const AlertsTable: React.FC<AlertsTableProps> = ({ hospitalId, userId }) => {
  const [notes, setNotes] = useState<Notes[]>([]);
  const [localNotes, setLocalNotes] = useState<Record<number | null, Notes>>(
    {}
  );
  const [editRowId, setEditRowId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    if (hospitalId) {
      const fetchNotes = async () => {
        try {
          const fetchedNotes = await getNotes(hospitalId);
          if (fetchedNotes) {
            setNotes(fetchedNotes);
          }
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      };
      fetchNotes();
    }

    // setCycleName(null);
  }, [hospitalId]);

  const handleAddRow = () => {
    const newNote: Notes = {
      Id: null,
      hospitalId: hospitalId,
      note: "",
      startDate: null,
      endDate: null,
      createdBy: userId,
      isActive: true,
    };
    setNotes([...notes, newNote]);
    // setRows([
    //   ...rows,
    //   {
    //     id: null,
    //     text: "",
    //     startDate: null,
    //     endDate: null,
    //     active: true,
    //   },
    // ]);
  };

  const handleInputChange = (
    id: number,
    field: string,
    value: string | boolean | Dayjs
  ) => {
    console.log(field, value);
    setNotes(
      notes.map((note) => (note.Id === id ? { ...note, [field]: value } : note))
    );

    setLocalNotes((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSaveRow = async (id: number) => {
    const note = notes.find((n) => n.Id === id);
    if (!note) return;

    try {
      await mergeNotes(
        note.Id,
        hospitalId,
        note.note,
        note.startDate ? dayjs(note.startDate).format("YYYY-MM-DD") : "",
        note.endDate ? dayjs(note.endDate).format("YYYY-MM-DD") : null,
        userId,
        note.isActive
      );
      console.log("Note saved successfully");

      // Refresh notes after saving
      const updatedNotes = await getNotes(hospitalId);
      setNotes(updatedNotes || []);
    } catch (error) {
      console.error("Error saving note:", error);
    }
    setEditRowId(null);
  };

  const [cleared, setCleared] = React.useState(false);

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
                <StyledTableCell width="35%" sx={{ fontFamily: "Poppins" }}>
                  Alert
                </StyledTableCell>
                <StyledTableCell sx={{ fontFamily: "Poppins" }}>
                  Start Date
                </StyledTableCell>
                <StyledTableCell sx={{ fontFamily: "Poppins" }}>
                  End Date
                </StyledTableCell>
                <StyledTableCell sx={{ fontFamily: "Poppins" }}>
                  Active
                </StyledTableCell>
                <StyledTableCell sx={{ fontFamily: "Poppins" }}>
                  Actions
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notes.map((note) => (
                <StyledTableRow key={note.Id}>
                  <StyledTableCell>
                    {/* <TextField
                      value={note.note}
                      onClick={() => {
                        setModalOpen(true);
                        setEditRowId(note.Id);
                        console.log(note.note);
                        setEditorContent(note.note);
                      }}
                      fullWidth
                      variant="outlined"
                      size="small"
                    /> */}
                    <div
                      onClick={() => {
                        setModalOpen(true);
                        setEditRowId(note.Id);
                        // setEditorContent(note.note);

                        // const contentBlock = htmlToDraft(note.note || "");
                        // const plainText = contentBlock.contentBlocks
                        //   .map((block) => block.getText())
                        //   .join("\n");
                        // setEditorContent(plainText);

                        // const blocksFromHTML = convertFromHTML(note.note || "");
                        // const contentState = ContentState.createFromBlockArray(
                        //   blocksFromHTML.contentBlocks,
                        //   blocksFromHTML.entityMap
                        // );
                        // const editorState =
                        //   EditorState.createWithContent(contentState);

                        // setEditorContent(editorState); // Pass editorState to modal


                      if (note.note) {
                        // Convert stored HTML back to DraftJS content state
                        const blocksFromHTML = convertFromHTML(note.note);
                        const contentState = ContentState.createFromBlockArray(
                          blocksFromHTML.contentBlocks,
                          blocksFromHTML.entityMap
                        );

                        // Convert content to raw JSON string
                        const rawContent = JSON.stringify(
                          convertToRaw(contentState)
                        );

                        setEditorContent(rawContent); // Store as a string
                      } else {
                        setEditorContent(""); // Handle empty case
                      }
                      }}
                      style={{
                        width: "100%",
                        minHeight: "36px",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                      }}
                      dangerouslySetInnerHTML={{ __html: note.note || "" }} // Render HTML content
                    >
                      {/* {note.note}{" "} */}
                    </div>
                  </StyledTableCell>
                  <StyledTableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        className="dateInput"
                        value={note.startDate ? dayjs(note.startDate) : null}
                        onChange={(newValue: Dayjs | null) => {
                          handleInputChange(
                            note.Id,
                            "startDate",
                            newValue ? newValue.toJSON() : ""
                          );
                          setEditRowId(note.Id);
                        }}
                        slotProps={{
                          field: {
                            clearable: true,
                            onClear: () => setCleared(true),
                          },
                        }}
                        // renderInput={(params: any) => (
                        //   <TextField {...params} size="small" fullWidth />
                        // )}
                      />
                    </LocalizationProvider>
                  </StyledTableCell>
                  <StyledTableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        className="dateInput"
                        value={
                          note.endDate != null ? dayjs(note.endDate) : null
                        }
                        onChange={(newValue: Dayjs | null) => {
                          handleInputChange(
                            note.Id,
                            "endDate",
                            newValue ? newValue.toJSON() : ""
                          );
                          setEditRowId(note.Id);
                        }}
                        slotProps={{
                          field: {
                            clearable: true,
                            onClear: () => setCleared(true),
                          },
                        }}
                        // renderInput={(params: any) => (
                        //   <TextField {...params} size="small" fullWidth />
                        // )}
                      />
                    </LocalizationProvider>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Switch
                      checked={note.isActive}
                      onChange={(e) => {
                        handleInputChange(note.Id, "active", e.target.checked);
                        setEditRowId(note.Id);
                      }}
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
                    {editRowId === note.Id && (
                      <Button
                        color="success"
                        variant="contained"
                        size="small"
                        onClick={() => handleSaveRow(note.Id)}
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
        content={editorContent} // Pass initial content
        setContent={(content) => {
          if (editRowId !== null || editRowId === null) {
            console.log(content);
            handleInputChange(editRowId, "note", content);
          }
        }}
      />
    </div>
  );
};

export default AlertsTable;
