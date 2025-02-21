import React, { useState, useEffect } from "react";
import { Message } from "../../Global/Message";
import { CustomButton } from "../../Global/CustomButton";
import WysiwygModal from "../WysiwygModal/WysiwygModal";
import { mergeNotes, getNotes } from "../../../utils/db-utils";
import { Notes } from "../../../types";
import noDataImage from "../../Assets/noData.png";
import { styled } from "@mui/material/styles";
import {
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableHead,
  Paper,
  TableCell,
  tableCellClasses,
  TablePagination,
  Switch,
  Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import dayjs, { Dayjs } from "dayjs";
import { ContentState, convertFromHTML, convertToRaw } from "draft-js";

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
  noteType: string;
}

const AlertsTable: React.FC<AlertsTableProps> = ({
  hospitalId,
  userId,
  noteType,
}) => {
  const [notes, setNotes] = useState<Notes[]>([]);
  const [localNotes, setLocalNotes] = useState<Record<number | null, Notes>>(
    {}
  );
  const [editRowId, setEditRowId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [cleared, setCleared] = React.useState(false);

  useEffect(() => {
    if (hospitalId) {
      const fetchNotes = async () => {
        try {
          const fetchedNotes = await getNotes(hospitalId, noteType);
          if (fetchedNotes) {
            setNotes(fetchedNotes);
          }
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      };
      fetchNotes();
    }
  }, [hospitalId, noteType]);

  const handleAddRow = () => {
    const newNote: Notes = {
      Id: null,
      hospitalId: hospitalId,
      note: "",
      startDate: null,
      endDate: null,
      createdBy: userId,
      isActive: true,
      noteType: noteType,
    };
    setNotes([...notes, newNote]);
  };

  const handleInputChange = (
    id: number,
    field: string,
    value: string | boolean | Dayjs
  ) => {
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
        note.isActive,
        note.noteType
      );
      console.log("Note saved successfully");

      // Refresh notes after saving
      const updatedNotes = await getNotes(hospitalId, noteType);
      setNotes(updatedNotes || []);
    } catch (error) {
      console.error("Error saving note:", error);
    }
    setEditRowId(null);
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginate the notes
  const paginatedMeals = notes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
              {paginatedMeals.map((note) => (
                <StyledTableRow key={note.Id}>
                  <StyledTableCell>
                    <div
                      onClick={() => {
                        setModalOpen(true);
                        setEditRowId(note.Id);

                        if (note.note) {
                          // Convert stored HTML back to DraftJS content state
                          const blocksFromHTML = convertFromHTML(note.note);
                          const contentState =
                            ContentState.createFromBlockArray(
                              blocksFromHTML.contentBlocks,
                              blocksFromHTML.entityMap
                            );

                          // Convert content to raw JSON string
                          const rawContent = JSON.stringify(
                            convertToRaw(contentState)
                          );

                          setEditorContent(rawContent);
                        } else {
                          setEditorContent("");
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
                      dangerouslySetInnerHTML={{ __html: note.note || "" }}
                    ></div>
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
                      <CustomButton
                        color="success"
                        variant="contained"
                        size="small"
                        onClick={() => handleSaveRow(note.Id)}
                      >
                        Save
                      </CustomButton>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {paginatedMeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Message
                      img={noDataImage}
                      alt={"No Data Available"}
                      title={"No Data Available"}
                      style={{ flexDirection: "row", height: "50vh" }}
                      imgWidth={"200px"}
                      titleFontWeight={"medium"}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box>
          <div style={{ paddingTop: "3px" }}>
            <CustomButton
              color="success"
              onClick={handleAddRow}
              sx={{
                minWidth: "37px",
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              <PlusCircleIcon className="size-6 text-[#FFB600]" />
            </CustomButton>
          </div>
        </Box>
        <TablePagination
          rowsPerPageOptions={[20, 50, 100]}
          component="div"
          count={notes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "& .MuiTablePagination-toolbar": {
              minHeight: "40px",
            },
          }}
        />
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
