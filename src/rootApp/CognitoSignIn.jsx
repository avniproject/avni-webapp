import { useState } from "react";
import { signIn, resetPassword, confirmResetPassword } from "aws-amplify/auth";
import SignInView from "./views/SignInView";
import ForgotPasswordView from "./views/ForgotPasswordView";
import {
  isDisallowedPassword,
  DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG
} from "./utils";
import ApplicationContext from "../ApplicationContext";

export default function CognitoSignIn({ onSignedIn }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("SIGN_IN"); // "SIGN_IN", "FORGOT_PASSWORD", "CONFIRM_RESET"
  const [resetUsername, setResetUsername] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async () => {
    if (!formData.username || !formData.password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      setLoading(true);
      const response = await signIn({
        username: formData.username,
        password: formData.password
      });
      const userData = { ...response, username: formData.username };
      onSignedIn(userData);
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setCurrentView("FORGOT_PASSWORD");
  };

  const handleResetPassword = async username => {
    setLoading(true);
    try {
      const output = await resetPassword({ username });
      setResetUsername(username);

      if (
        output.nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE"
      ) {
        setCurrentView("CONFIRM_RESET");
      }
    } catch (error) {
      // Handle specific AWS Cognito errors
      let errorMessage = error.message || "Failed to send reset code";

      if (
        error.name === "LimitExceededException" ||
        errorMessage.includes("Attempt limit exceeded")
      ) {
        errorMessage =
          "Too many reset attempts. Please wait a few minutes before trying again.";
      } else if (error.name === "UserNotFoundException") {
        errorMessage =
          "Username not found. Please check your username and try again.";
      } else if (error.name === "InvalidParameterException") {
        errorMessage = "Invalid username format. Please check your username.";
      }

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetPassword = async ({
    username,
    confirmationCode,
    newPassword
  }) => {
    setLoading(true);
    try {
      await confirmResetPassword({
        username,
        confirmationCode,
        newPassword
      });
      // After successful reset, go back to sign in
      setTimeout(() => {
        setCurrentView("SIGN_IN");
      }, 2000);
    } catch (error) {
      // Handle specific AWS Cognito errors
      let errorMessage = error.message || "Failed to reset password";

      if (error.name === "CodeMismatchException") {
        errorMessage =
          "Invalid confirmation code. Please check the code and try again.";
      } else if (error.name === "ExpiredCodeException") {
        errorMessage =
          "Confirmation code has expired. Please request a new reset code.";
      } else if (error.name === "InvalidPasswordException") {
        errorMessage =
          "Password does not meet requirements. Please choose a stronger password.";
      } else if (error.name === "LimitExceededException") {
        errorMessage =
          "Too many attempts. Please wait a few minutes before trying again.";
      }

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setCurrentView("SIGN_IN");
    setResetUsername("");
  };

  if (currentView === "FORGOT_PASSWORD") {
    return (
      <ForgotPasswordView
        onResetPassword={handleResetPassword}
        onBackToSignIn={handleBackToSignIn}
        loading={loading}
        step="REQUEST_RESET"
      />
    );
  }

  if (currentView === "CONFIRM_RESET") {
    return (
      <ForgotPasswordView
        onConfirmResetPassword={handleConfirmResetPassword}
        onBackToSignIn={handleBackToSignIn}
        loading={loading}
        step="CONFIRM_RESET"
        initialUsername={resetUsername}
      />
    );
  }

  return (
    <SignInView
      notifyInputChange={handleChange}
      onSignIn={handleSignIn}
      onForgotPassword={handleForgotPassword}
      loading={loading}
    />
  );
}
