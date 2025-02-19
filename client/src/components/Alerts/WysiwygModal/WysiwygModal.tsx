import React, { useState, useEffect } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Modal, DialogActions, Button, Box } from "@mui/material";
import {
  EditorState,
  convertToRaw,
  ContentState,
  convertFromRaw,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";

interface WysiwygModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setContent: (content: string) => void;
  content: string;
}

const WysiwygModal: React.FC<WysiwygModalProps> = ({
  open,
  setOpen,
  setContent,
  content,
}) => {
  const initialEditorState = content
    ? EditorState.createWithContent(convertFromRaw(JSON.parse(content)))
    : EditorState.createEmpty();
  const [editorState, setEditorState] = useState(initialEditorState);

  useEffect(() => {
    if (content) {
      try {
        const contentState = convertFromRaw(JSON.parse(content));
        setEditorState(EditorState.createWithContent(contentState));
      } catch (e) {
        setEditorState(
          EditorState.createWithContent(ContentState.createFromText(content))
        );
      }
    }
  }, [content]);

  const handleSave = () => {
    const rawContent = convertToRaw(editorState.getCurrentContent());
    const markup = draftToHtml(rawContent);
    setContent(markup); // Store as stringified JSON
    setOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 900,
            bgcolor: "white",
            p: 3,
            margin: "auto",
            marginTop: "10%",
          }}
        >
          <Editor
            editorState={editorState}
            wrapperClassName="wysiwyg-wrapper"
            editorClassName="wysiwyg-editor"
            onEditorStateChange={setEditorState}
            toolbar={{
              options: ["inline", "list", "textAlign", "link"],
              inline: { inDropdown: false },
              list: { inDropdown: true },
              textAlign: { inDropdown: true },
              colorPicker: {},
              link: { inDropdown: true },
              emoji: { inDropdown: false },
              history: { options: ["undo", "redo"] },
            }}
          />
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="error">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" color="success">
              Save
            </Button>
          </DialogActions>
        </Box>
      </Modal>
    </>
  );
};

export default WysiwygModal;
