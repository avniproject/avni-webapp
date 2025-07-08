import { styled } from "@mui/material/styles";
import { Fab } from "@mui/material";

const StyledFab = styled(Fab)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginRight: "10px",
  height: "28px",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark
  }
}));

const Button = ({ btnLabel, btnClick, btnDisabled, id, ...props }) => {
  return (
    <StyledFab variant="extended" color="primary" aria-label="add" onClick={btnClick} disabled={btnDisabled} id={id} {...props}>
      {btnLabel}
    </StyledFab>
  );
};

export default Button;
