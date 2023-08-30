class MuiComponentHelper {
  static getDialogClosingHandler(handleClose) {
    return (event, reason) => {
      if (reason !== "backdropClick" && reason !== "escapeKeyDown" && handleClose) {
        handleClose(event, reason);
      }
    };
  }
}

export default MuiComponentHelper;
