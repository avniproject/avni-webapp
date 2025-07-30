import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Stack,
  Alert,
  Link
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledRootContainer = styled(Box)({
  display: "flex",
  height: "100vh",
  alignItems: "center",
  justifyContent: "center"
});

const StyledCard = styled(Card)({
  minWidth: 400,
  maxWidth: 500,
  padding: "20px"
});

const StyledButton = styled(Button)({
  marginTop: "16px",
  marginBottom: "8px"
});

function ForgotPasswordView({
  onResetPassword,
  onConfirmResetPassword,
  onBackToSignIn,
  loading,
  step = "REQUEST_RESET" // "REQUEST_RESET" or "CONFIRM_RESET"
}) {
  const [formData, setFormData] = useState({
    username: "",
    confirmationCode: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRequestReset = async e => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError("Please enter your username");
      return;
    }

    try {
      await onResetPassword(formData.username);
      setSuccess("Reset code SMS has been sent! Please check your phone.");
    } catch (err) {
      setError(err.message || "Failed to send reset code");
    }
  };

  const handleConfirmReset = async e => {
    e.preventDefault();
    if (!formData.confirmationCode.trim() || !formData.newPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await onConfirmResetPassword({
        username: formData.username,
        confirmationCode: formData.confirmationCode,
        newPassword: formData.newPassword
      });
      setSuccess(
        "Password reset successfully! You can now sign in with your new password."
      );
    } catch (err) {
      setError(err.message || "Failed to reset password");
    }
  };

  return (
    <StyledRootContainer>
      <StyledCard>
        <CardHeader
          title={step === "REQUEST_RESET" ? "Reset Password" : "Confirm Reset"}
        />
        <CardContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {step === "REQUEST_RESET" && (
              <form onSubmit={handleRequestReset}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </StyledButton>
              </form>
            )}

            {step === "CONFIRM_RESET" && (
              <form onSubmit={handleConfirmReset}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  margin="normal"
                  required
                  disabled
                />
                <TextField
                  fullWidth
                  label="Confirmation Code"
                  name="confirmationCode"
                  type="tel"
                  value={formData.confirmationCode}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFormData(prev => ({ ...prev, confirmationCode: value }));
                    setError("");
                  }}
                  onKeyPress={e => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      ![
                        "Backspace",
                        "Delete",
                        "Tab",
                        "Escape",
                        "Enter",
                        "Home",
                        "End",
                        "ArrowLeft",
                        "ArrowRight",
                        "Clear",
                        "Copy",
                        "Paste"
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  margin="normal"
                  required
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 6
                  }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <StyledButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </StyledButton>
              </form>
            )}

            <Box textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={onBackToSignIn}
                type="button"
              >
                Back to Sign In
              </Link>
            </Box>
          </Stack>
        </CardContent>
      </StyledCard>
    </StyledRootContainer>
  );
}

export default ForgotPasswordView;
