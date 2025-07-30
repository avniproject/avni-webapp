// Common AppBar styles and components
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

// Common styled components that both AppBars can use
export const CommonAppBarStyles = {
  // Common AppBar container styles
  appBarContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "0 1em",
    minHeight: "64px",
    backgroundColor: "#1976d2" // Consistent blue color
  },

  // Common toolbar styles
  toolbar: {
    width: "100%",
    minHeight: "auto",
    justifyContent: "space-between",
    display: "flex",
    alignItems: "center",
    padding: 0
  },

  // Common typography styles
  title: {
    flex: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    fontWeight: "bold",
    color: "white"
  },

  // Common user info section styles
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: "white"
  }
};

// Shared styled components
export const StyledAppBarTitle = styled(Typography)(({ theme }) => ({
  ...CommonAppBarStyles.title,
  fontSize: theme.spacing(3)
}));

export const StyledUserSection = styled(Box)(() => ({
  ...CommonAppBarStyles.userSection
}));

export const StyledOrganisationInfo = styled(Box)(({ theme }) => ({
  marginX: theme.spacing(2),
  color: "white",
  fontWeight: "bold"
}));

// Common AppBar wrapper component
export const CommonAppBarWrapper = styled("div")(({ theme }) => ({
  ...CommonAppBarStyles.appBarContainer,
  "& .MuiToolbar-root": {
    ...CommonAppBarStyles.toolbar
  }
}));
