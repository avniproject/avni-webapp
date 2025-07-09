import { styled } from "@mui/material/styles";
import { Paper } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginRight: theme.spacing(2),
  boxSizing: "border-box"
}));

const Body = ({ ...props }) => {
  return <StyledPaper {...props}>{props.children}</StyledPaper>;
};

export default Body;
