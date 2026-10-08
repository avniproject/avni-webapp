import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { networkErrorNotifier } from "../utils/networkErrorNotifier";

export const NetworkErrorSnackbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = networkErrorNotifier.subscribe(() => setIsOpen(true));
    const close = () => setIsOpen(false);
    window.addEventListener("online", close);
    return () => {
      unsubscribe();
      window.removeEventListener("online", close);
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setIsOpen(false);
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity="warning" variant="filled" onClose={handleClose}>
        Unable to reach the server. Please check your internet connection.
        Changes you have not saved are still on this page, save again once you
        are back online.
      </Alert>
    </Snackbar>
  );
};
