import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import SignInView from "./views/SignInView";
import { isDisallowedPassword, DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG } from "./utils";
import ApplicationContext from "../ApplicationContext";

export default function CognitoSignIn({ onSignedIn }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async () => {
    const { username, password } = formData;
    if (ApplicationContext.isNonProdAndNonDevEnv() && isDisallowedPassword(password)) {
      alert(DISALLOWED_PASSWORD_BLOCK_LOGIN_MSG);
      return;
    }

    try {
      setLoading(true);
      const response = await signIn({ username, password });
      onSignedIn(response);
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return <SignInView notifyInputChange={handleChange} onSignIn={handleSignIn} loading={loading} />;
}
