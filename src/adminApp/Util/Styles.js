import { Box, styled } from "@mui/material";
import { AutocompleteArrayInput, ReferenceArrayInput, SelectInput, TextInput, SimpleShowLayout, Show } from "react-admin";

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

export const StyledAutocompleteArrayInput = styled(AutocompleteArrayInput)({
  display: "inline-block",
  width: "auto",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    width: "auto",
    minWidth: "120px"
  }
});

export const StyledSelectInput = styled(SelectInput)(({ theme }) => ({
  width: "auto",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    width: "auto",
    paddingRight: theme.spacing(10)
  }
}));

export const StyledSimpleShowLayout = styled(SimpleShowLayout)(({ theme }) => ({
  backgroundColor: "transparent",
  borderRadius: 0,
  boxShadow: "none",
  padding: theme.spacing(2),
  margin: 0,

  "& .RaLabeled-label": {
    fontWeight: 600,
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    minWidth: "140px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  "& .RaLabeled-value": {
    fontSize: "0.95rem",
    color: theme.palette.text.primary,
    fontWeight: 400,
    lineHeight: 1.5
  },

  "& .RaLabeled-fullWidth": {
    marginBottom: theme.spacing(2.5),
    paddingBottom: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,

    "&:last-child": {
      borderBottom: "none",
      marginBottom: 0,
      paddingBottom: 0
    }
  },

  "& .RaTextField": {
    "& span": {
      color: theme.palette.text.primary
    }
  },

  "& .RaReferenceField": {
    "& a": {
      color: theme.palette.primary.main,
      textDecoration: "none",
      fontWeight: 500,

      "&:hover": {
        textDecoration: "underline"
      }
    }
  },

  "& .RaReferenceManyField": {
    "& .RaLabeled-value": {
      marginTop: theme.spacing(1)
    }
  },

  "& .RaSingleFieldList": {
    "& .MuiChip-root": {
      margin: theme.spacing(0.25),
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      fontSize: "0.8rem"
    }
  }
}));

export const StyledShow = styled(Show)(({ theme }) => ({
  "& .RaShow-main": {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2)
  },

  "& .RaShow-card": {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius * 2,
    overflow: "hidden",
    margin: theme.spacing(1, 0),

    "& > *": {
      backgroundColor: theme.palette.background.paper,
      margin: 0
    }
  },

  "& .RaShow-main > *": {
    margin: 0,
    backgroundColor: theme.palette.background.paper
  },

  "& .RaTopToolbar-root, & .RaToolbar-root": {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5, 3),
    minHeight: "auto",
    boxShadow: "none",
    margin: 0
  },

  "& .RaShowActions": {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1.5, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    margin: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },

  "& .MuiCardActions-root": {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1.5, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    margin: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: "auto",

    "& > *": {
      float: "none !important",
      display: "inline-flex"
    }
  },

  "& .RaShow-title, & .RaTitleForRecord": {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 3),
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`
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
      backgroundColor: theme.palette.background.paper,
      margin: 0
    }
  },

  "& .MuiToolbar-root": {
    backgroundColor: theme.palette.background.paper,
    minHeight: "auto",
    padding: theme.spacing(1.5, 3),
    margin: 0,

    "& .MuiButton-root": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: theme.shadows[1],

      "&:hover": {
        backgroundColor: theme.palette.primary.dark
      }
    }
  },

  "& .RaShow-content": {
    backgroundColor: theme.palette.background.paper,
    margin: 0,
    padding: 0
  },

  "& .MuiPaper-root": {
    backgroundColor: theme.palette.background.paper,
    margin: 0,

    "&:not(:first-child)": {
      borderRadius: 0,
      boxShadow: "none"
    }
  },

  "& > div": {
    backgroundColor: theme.palette.background.paper,

    "& .MuiCardActions-root": {
      position: "relative",
      zIndex: 1,
      backgroundColor: theme.palette.background.paper,
      borderBottom: `1px solid ${theme.palette.divider}`
    }
  }
}));
