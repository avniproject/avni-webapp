import { styled } from "@mui/material/styles";

export const Root = styled("div")(({ theme }) => ({
  paddingRight: theme.spacing(5),
  paddingLeft: theme.spacing(5),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(40),
  backgroundColor: "#F5F7F9",
  overflow: "auto",
  position: "fixed",
  height: "100vh"
}));

export const Filter = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(5)
}));

export const Header = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

export const TextField = styled("div")({
  backgroundColor: "#FFF"
});

export const ApplyButton = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  width: "26%",
  paddingRight: theme.spacing(5),
  paddingLeft: theme.spacing(5),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  backgroundColor: "#F5F7F9"
}));
