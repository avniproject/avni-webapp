import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const CommonAppBarStyles = theme => ({
  appBarContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "0 16px",
    minHeight: "64px",
    backgroundColor: theme.palette.primary.main // Using theme primary color
  },

  toolbar: {
    width: "100%",
    minHeight: "64px",
    justifyContent: "space-between",
    display: "flex",
    alignItems: "center",
    padding: 0,
    gap: 2
  },

  title: {
    flex: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    color: theme.palette.primary.contrastText,
    marginLeft: 2
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    "& > *": {
      margin: 0,
      padding: 0
    }
  }
});

export const StyledOrganisationInfo = styled(Box)(({ theme }) => ({
  whiteSpace: "nowrap"
}));
