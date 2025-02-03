import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface WysiwygModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setContent: (content: string) => void;
} 

const WysiwygModal: React.FC<WysiwygModalProps> = ({
  open,
  setOpen,
  setContent,
}) => {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );

  const handleSave = () => {
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const text = rawContentState.blocks.map((block) => block.text).join("\n");
    setContent(text);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
      <DialogTitle>Edit Alert Note</DialogTitle>
      <DialogContent>
        <Editor
          wrapperClassName="wysiwyg-wrapper"
          editorClassName="wysiwyg-editor"
          editorState={editorState}
          onEditorStateChange={setEditorState}
          toolbar={{
            options: [
              "inline",
              "blockType",
              "fontSize",
              "list",
              "textAlign",
              "colorPicker",
              "link",
              "emoji",
              "image",
              "history",
            ],
            inline: {
              options: ["bold", "italic", "underline", "strikethrough"],
            },
            list: { options: ["unordered", "ordered"] },
            textAlign: { options: ["left", "center", "right", "justify"] },
            colorPicker: {},
            link: {},
            emoji: {},
            image: {},
            history: { options: ["undo", "redo"] },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="error">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="success">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WysiwygModal;
