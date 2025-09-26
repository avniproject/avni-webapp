import { Box, styled, Typography } from "@mui/material";
import { AutocompleteArrayInput, AutocompleteInput, SelectInput, TextInput, SimpleShowLayout, Show } from "react-admin";

export const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1), // Reduced from 3.5 to 1 for better positioning
  marginRight: theme.spacing(1.5),
  boxShadow: theme.shadows[2],
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

export const StyledTextInput = styled(TextInput)({
  "& .MuiInputBase-input": {
    backgroundColor: "white",
  },
  "& .RaResettableTextField-clearButton": {
    backgroundColor: "white",
  },
  width: "auto",
  display: "inline-block",
});

export const datagridStyles = {
  border: `0.0625rem solid #e0e0e0`, // 1px = 0.0625rem
  overflow: "hidden",
  backgroundColor: "#fff",
  minHeight: "25rem", // 400px = 25rem

  "& .RaDatagrid-headerCell": {
    backgroundColor: "#f5f5f5",
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#333",
    padding: "0.75rem 1rem", // 12px 16px = 0.75rem 1rem
    borderBottom: "0.0625rem solid #e0e0e0",
  },

  "& .RaDatagrid-row": {
    borderBottom: "0.0625rem solid #f0f0f0",

    "&:hover": {
      backgroundColor: "#fafafa",
    },

    "& td": {
      padding: "0.5rem 0.75rem", // 8px 12px = 0.5rem 0.75rem
      fontSize: "0.875rem",
      color: "#444",
    },
  },

  "& .RaDatagrid-headerRow": {
    borderBottom: "0.0625rem solid #ccc",
  },

  "& .column-title": {
    fontWeight: "500",
    color: "#222",
  },
};

export const StyledAutocompleteArrayInput = styled(AutocompleteArrayInput)({
  width: "auto",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    width: "auto",
    minWidth: "7.5rem", // 120px = 7.5rem
  },
});

export const StyledAutocompleteInput = styled(AutocompleteInput)({
  width: "auto",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    width: "auto",
    minWidth: "7.5rem", // 120px = 7.5rem
  },
});

export const StyledSelectInput = styled(SelectInput)(({ theme }) => ({
  width: "12rem",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    width: "100%",
  },
}));

export const StyledSimpleShowLayout = styled(SimpleShowLayout)(({ theme }) => ({
  backgroundColor: "transparent",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "none",

  "& .RaLabeled-label": {
    fontWeight: 600,
    fontSize: "0.75rem",
    color: theme.palette.primary.light,
    minWidth: "12rem",
    textTransform: "capitalize",
    letterSpacing: "0.05rem",
    marginLeft: theme.spacing(-1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(0.5),
  },

  "& .RaLabeled-value": {
    fontSize: "1rem",
    color: theme.palette.text.primary,
    fontWeight: 400,
    lineHeight: 1.6,
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[200]}`,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",

    "&:hover": {
      borderColor: theme.palette.primary.light,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
  },

  "& .RaLabeled-fullWidth": {
    marginBottom: theme.spacing(4),
    paddingBottom: 0,
    borderBottom: "none",

    "&:last-child": {
      marginBottom: 0,
    },
  },

  "& .RaTextField": {
    "& span": {
      color: theme.palette.text.primary,
      fontWeight: 400,
    },
  },

  "& .RaReferenceField": {
    "& a": {
      color: theme.palette.primary.main,
      textDecoration: "none",
      fontWeight: 500,
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: `${theme.palette.primary.main}08`,
      border: `1px solid ${theme.palette.primary.light}40`,
      transition: "all 0.2s ease",

      "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderColor: theme.palette.primary.main,
      },
    },
  },

  "& .RaReferenceManyField": {
    "& .RaLabeled-value": {
      marginTop: theme.spacing(1),
      backgroundColor: theme.palette.background.paper,
    },
  },

  "& .RaSingleFieldList": {
    "& .MuiChip-root": {
      margin: theme.spacing(0.5),
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      fontSize: "0.8rem",
      fontWeight: 500,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",

      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

export const StyledShow = styled(Show)(({ theme }) => ({
  "& .RaShow-main": {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3, 4),
    minHeight: "auto",
  },

  "& .RaShow-card": {
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
    margin: theme.spacing(3, 0),
    border: `1px solid ${theme.palette.grey[200]}`,

    "& > *": {
      backgroundColor: "transparent",
      margin: 0,
    },
  },

  "& .RaShow-main > *": {
    margin: 0,
    backgroundColor: "transparent",
  },

  "& .RaTopToolbar-root, & .RaToolbar-root": {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    padding: theme.spacing(2, 4),
    minHeight: "auto",
    boxShadow: "none",
    margin: 0,
  },

  "& .RaShowActions": {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4),
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    margin: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  "& .MuiCardActions-root": {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4),
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    margin: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: "auto",

    "& > *": {
      float: "none !important",
      display: "inline-flex",
    },
  },

  "& .RaShow-title, & .RaTitleForRecord": {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3, 4),
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },

  "& .RaShow-header": {
    backgroundColor: theme.palette.background.paper,
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",

    "& > *": {
      backgroundColor: "transparent",
      margin: 0,
    },
  },

  "& .MuiToolbar-root": {
    backgroundColor: theme.palette.background.paper,
    minHeight: "auto",
    padding: theme.spacing(2, 4),
    margin: 0,

    "& .MuiButton-root": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      borderRadius: theme.shape.borderRadius,
      fontWeight: 500,
      textTransform: "none",
      transition: "all 0.2s ease",

      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
      },
    },
  },

  "& .RaShow-content": {
    backgroundColor: "transparent",
    margin: 0,
    padding: theme.spacing(4),
  },

  "& .MuiPaper-root": {
    backgroundColor: theme.palette.background.paper,
    margin: 0,

    "&:not(:first-of-type)": {
      borderRadius: theme.shape.borderRadius,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    },
  },

  "& > div": {
    backgroundColor: "transparent",

    "& .MuiCardActions-root": {
      position: "relative",
      zIndex: 1,
      backgroundColor: theme.palette.background.paper,
      borderBottom: `1px solid ${theme.palette.grey[200]}`,
    },
  },
}));

export const StyledTypographyError = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
}));
