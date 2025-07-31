// Common AppBar styles and components
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

// Common styled components that both AppBars can use
export const CommonAppBarStyles = theme => ({
  // Common AppBar container styles
  appBarContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "0 16px",
    minHeight: "64px",
    backgroundColor: theme.palette.primary.main // Using theme primary color
  },

  // Common toolbar styles
  toolbar: {
    width: "100%",
    minHeight: "64px",
    justifyContent: "space-between",
    display: "flex",
    alignItems: "center",
    padding: 0,
    gap: 2
  },

  // Common typography styles
  title: {
    flex: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    fontWeight: "bold",
    color: "white",
    marginLeft: 2
  },

  // Common user info section styles
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    color: "white",
    "& > *": {
      margin: 0,
      padding: 0
    }
  }
});

// Shared styled components
export const StyledAppBarTitle = styled(Typography)(({ theme }) => ({
  ...CommonAppBarStyles(theme).title,
  fontSize: theme.spacing(3)
}));

export const StyledUserSection = styled(Box)(({ theme }) => ({
  ...CommonAppBarStyles(theme).userSection
}));

export const StyledOrganisationInfo = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  color: "white",
  fontWeight: "bold",
  whiteSpace: "nowrap"
}));

// Common AppBar wrapper component
export const CommonAppBarWrapper = styled("div")(({ theme }) => ({
  ...CommonAppBarStyles(theme).appBarContainer,
  "& .MuiToolbar-root": {
    ...CommonAppBarStyles(theme).toolbar
  }
}));
