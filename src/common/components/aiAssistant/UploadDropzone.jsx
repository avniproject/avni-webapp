import { useRef, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

/**
 * Multi-file xlsx dropzone — backed by a hidden <input type="file"> so
 * keyboard / accessibility flows still work alongside drag-and-drop.
 *
 * Props:
 *  - onFiles: (File[]) => Promise
 *  - disabled: boolean
 */
const UploadDropzone = ({ onFiles, disabled }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handle = async (files) => {
    if (!files || !files.length || disabled) return;
    const xlsxOnly = [...files].filter((f) =>
      f.name.toLowerCase().match(/\.(xlsx|xls)$/),
    );
    if (xlsxOnly.length === 0) return;
    await onFiles(xlsxOnly);
  };

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setDragging(false);
        await handle(e.dataTransfer.files);
      }}
      sx={{
        m: 2,
        p: 2.5,
        border: "2px dashed",
        borderColor: dragging ? "primary.main" : "rgba(0,0,0,0.18)",
        borderRadius: 2.5,
        backgroundColor: dragging ? "primary.light" : "#f7f8fa",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background-color 0.2s, border-color 0.2s",
        "&:hover": disabled
          ? {}
          : { borderColor: "primary.main", backgroundColor: "#eef4fc" },
      }}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <CloudUpload sx={{ fontSize: 32, color: "primary.main", mb: 0.5 }} />
      <Typography variant="body2" color="text.primary">
        Drop scoping/modelling .xlsx here, or click to browse
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handle(e.target.files)}
        disabled={disabled}
      />
    </Box>
  );
};

export default UploadDropzone;
