import { makeStyles } from "@mui/styles";

export const useStyle = makeStyles(theme => ({
  root: {
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(40),
    backgroundColor: "#F5F7F9",
    overflow: "auto",
    position: "fixed",
    height: "100vh"
  },
  filter: {
    marginBottom: theme.spacing(5)
  },
  header: {
    marginBottom: theme.spacing(3)
  },
  textField: {
    backgroundColor: "#FFF"
  },
  applyButton: {
    position: "absolute",
    bottom: 0,
    width: "26%",
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: "#F5F7F9"
  }
}));
