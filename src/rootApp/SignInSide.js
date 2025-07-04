import { styled } from "@mui/material/styles";
import { Avatar, Button, CssBaseline, TextField, FormControlLabel, Checkbox, Link, Paper, Box, Grid, Typography } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import SideImage from "formDesigner/styles/images/background.jpg";

const StyledRootGrid = styled(Grid)({
  height: "100vh"
});

const StyledImageGrid = styled(Grid)(({ theme }) => ({
  backgroundImage: `url(${SideImage})`,
  backgroundRepeat: "no-repeat",
  backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
  backgroundSize: "cover",
  backgroundPosition: "center"
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(8, 4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(1)
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2)
}));

const StyledCopyrightBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(5)
}));

const StyledCopyrightTypography = styled(Typography)(({ theme }) => ({
  variant: "body2",
  color: theme.palette.text.secondary,
  textAlign: "center"
}));

function Copyright() {
  return (
    <StyledCopyrightTypography>
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </StyledCopyrightTypography>
  );
}

export default function SignInSide() {
  return (
    <StyledRootGrid container component="main">
      <CssBaseline />
      <StyledImageGrid size={{ xs: false, sm: 4, md: 7 }} />
      <Grid component={StyledPaper} elevation={6} square size={{ xs: 12, sm: 8, md: 5 }}>
        <StyledPaper>
          <StyledAvatar>
            <LockOutlined />
          </StyledAvatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <StyledForm noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
            <StyledSubmitButton type="submit" fullWidth variant="contained" color="primary">
              Sign In
            </StyledSubmitButton>
            <Grid container>
              <Grid size="grow">
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid>
                <Link href="#" variant="body2">
                  Don't have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
            <StyledCopyrightBox>
              <Copyright />
            </StyledCopyrightBox>
          </StyledForm>
        </StyledPaper>
      </Grid>
    </StyledRootGrid>
  );
}
