import { Box, styled } from "@mui/material";
import { AutocompleteArrayInput, ReferenceArrayInput, SelectArrayInput, TextInput } from "react-admin";

export const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1), // Reduced from 3.5 to 1 for better positioning
  marginRight: theme.spacing(1.5),
  boxShadow: theme.shadows[2],
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper
}));

export const StyledTextInput = styled(TextInput)({
  "& .MuiInputBase-input": {
    backgroundColor: "white"
  },
  "& .RaResettableTextField-clearButton": {
    backgroundColor: "white"
  },
  width: "auto",
  display: "inline-block"
});

export const datagridStyles = {
  border: `1px solid #e0e0e0`,
  borderRadius: 2,
  overflow: "hidden",
  backgroundColor: "#fff",

  "& .RaDatagrid-headerCell": {
    backgroundColor: "#f5f5f5",
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#333",
    padding: "12px 16px",
    borderBottom: "1px solid #e0e0e0"
  },

  "& .RaDatagrid-row": {
    borderBottom: "1px solid #f0f0f0",

    "&:hover": {
      backgroundColor: "#fafafa"
    },

    "& td": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      color: "#444"
    }
  },

  "& .RaDatagrid-headerRow": {
    borderBottom: "1px solid #ccc"
  },

  "& .column-title": {
    fontWeight: "500",
    color: "#222"
  }
};

export const StyledReferenceArrayInput = styled(ReferenceArrayInput)({
  display: "inline-block",
  width: "auto",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    display: "inline-flex",
    width: "auto"
  }
});

export const StyledSelectArrayInput = styled(SelectArrayInput)({
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    display: "inline-flex",
    width: "auto"
  }
});

export const StyledAutocompleteArrayInput = styled(AutocompleteArrayInput)({
  display: "inline-block",
  width: "auto",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    width: "auto",
    minWidth: "120px"
  }
});
