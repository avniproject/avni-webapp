import {
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Close as CloseIcon, SmartToy } from "@mui/icons-material";
import Icon from "./components/Icon";
import { styled } from "@mui/material/styles";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "1rem",
    maxWidth: "62.5rem",
    width: "90%",
    margin: "auto",
    padding: 0,
  },
}));

const HeaderContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "2rem 2rem 1.5rem",
  position: "relative",
});

const CloseButton = styled(IconButton)({
  position: "absolute",
  top: "1rem",
  right: "1rem",
  color: "#666",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

const StyledCard = styled(Card)({
  height: "17.5rem",
  width: "17.5rem",
  display: "flex",
  flexDirection: "column",
  borderRadius: "0.75rem",
  border: "1px solid #e0e0e0",
  transition: "box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0 0.25rem 1.25rem rgba(0, 0, 0, 0.1)",
    transform: "translateY(-0.125rem)",
  },
});

const CardContentWrapper = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "2rem 1.5rem",
  height: "100%",
});

const IconContainer = styled(Box)(({ theme }) => ({
  marginBottom: "1.5rem",
  "& svg": {
    fontSize: "4rem",
    color: theme.palette.primary.main,
  },
}));

const WelcomeModal = ({ open, onClose, onOptionSelect }) => {
  const handleOptionClick = (option) => {
    onClose();
    // Delay action dispatch to allow modal to close first
    if (onOptionSelect) {
      setTimeout(() => {
        onOptionSelect(option);
      }, 100);
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={false}>
      <HeaderContainer>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 500, marginBottom: 1 }}>
            Welcome to Avni!
          </Typography>
          <Typography variant="subtitle1" sx={{ fontSize: "1rem" }}>
            Your one stop solution to all your program needs
          </Typography>
        </Box>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </HeaderContainer>

      <DialogContent sx={{ padding: "0 2rem 2rem" }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={4}>
            <StyledCard onClick={() => handleOptionClick("templates")}>
              <CardContentWrapper>
                <IconContainer>
                  <Icon name="templates" width={64} height={64} />
                </IconContainer>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 500, marginBottom: 2 }}
                >
                  Explore All Templates
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  Learn about Avni through our varied use cases
                </Typography>
              </CardContentWrapper>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledCard onClick={() => handleOptionClick("ai")}>
              <CardContentWrapper>
                <IconContainer>
                  <SmartToy />
                </IconContainer>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 500, marginBottom: 2 }}
                >
                  Explore Using AI
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  Design your programs from scratch using the AI Assistant
                </Typography>
              </CardContentWrapper>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledCard onClick={() => handleOptionClick("appdesigner")}>
              <CardContentWrapper>
                <IconContainer>
                  <Icon name="startFresh" width={64} height={64} />
                </IconContainer>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 500, marginBottom: 2 }}
                >
                  Start Fresh
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  Design your programs from scratch using the App Designer
                </Typography>
              </CardContentWrapper>
            </StyledCard>
          </Grid>
        </Grid>
      </DialogContent>
    </StyledDialog>
  );
};

export default WelcomeModal;
