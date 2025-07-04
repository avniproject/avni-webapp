import { styled } from "@mui/material/styles";
import { Paper } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2)
}));

const Body = props => {
  return <StyledPaper {...props}>{props.children}</StyledPaper>;
};

export default Body;
