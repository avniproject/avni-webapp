import { styled } from "@mui/material/styles";
import { Fab } from "@mui/material";
import { clsx } from "clsx";

const StyledFab = styled(Fab)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginRight: "10px",
  height: "28px"
}));

const Button = ({ btnLabel, btnClass, btnClick, btnDisabled, id, ...props }) => {
  return (
    <StyledFab
      className={clsx(btnClass)}
      variant="extended"
      color="primary"
      aria-label="add"
      onClick={btnClick}
      disabled={btnDisabled}
      id={id}
      {...props}
    >
      {btnLabel}
    </StyledFab>
  );
};

export default Button;
