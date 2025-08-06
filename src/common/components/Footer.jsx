import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderTop: `1px solid ${theme.palette.grey[300]}`,
  marginTop: theme.spacing(4),
  width: "100%",
  boxSizing: "border-box"
}));

const Footer = () => {
  return <StyledFooter />;
};

export default Footer;
