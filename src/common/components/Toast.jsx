import { Portal, Alert, Snackbar } from "@mui/material";

class ToastManager {
  static instance = null;
  static defaultDuration = 4000;

  constructor() {
    if (ToastManager.instance) {
      return ToastManager.instance;
    }
    this.toasts = new Set();
    ToastManager.instance = this;
  }

  showError(message, duration = ToastManager.defaultDuration) {
    this.showToast(message, "error", duration);
  }

  showSuccess(message, duration = ToastManager.defaultDuration) {
    this.showToast(message, "success", duration);
  }

  showWarning(message, duration = ToastManager.defaultDuration) {
    this.showToast(message, "warning", duration);
  }

  showInfo(message, duration = ToastManager.defaultDuration) {
    this.showToast(message, "info", duration);
  }

  showToast(
    message,
    severity = "error",
    duration = ToastManager.defaultDuration,
  ) {
    const toastId = Date.now() + Math.random();

    // Create container if it doesn't exist
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.id = `toast-${toastId}`;
    toast.style.cssText = `
      background-color: ${this.getBackgroundColor(severity)};
      color: ${this.getTextColor(severity)};
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      word-wrap: break-word;
      pointer-events: auto;
      transform: translateY(100%);
      opacity: 0;
      transition: all 0.3s ease-out;
    `;

    toast.textContent = message;
    container.appendChild(toast);
    this.toasts.add(toastId);

    // Animate in
    window.requestAnimationFrame(() => {
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
    });

    // Auto-remove
    setTimeout(() => {
      this.removeToast(toastId);
    }, duration);

    return toastId;
  }

  removeToast(toastId) {
    const toast = document.getElementById(`toast-${toastId}`);
    if (toast && this.toasts.has(toastId)) {
      toast.style.transform = "translateY(100%)";
      toast.style.opacity = "0";

      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.toasts.delete(toastId);

        // Clean up container if empty
        const container = document.getElementById("toast-container");
        if (container && container.children.length === 0) {
          container.parentNode.removeChild(container);
        }
      }, 300);
    }
  }

  getBackgroundColor(severity) {
    // Using softer colors that align with Avni theme (Material-UI light variants)
    switch (severity) {
      case "success":
        return "#81c784"; // green[300] - softer green
      case "warning":
        return "#ffb74d"; // orange[300] - softer orange
      case "info":
        return "#64b5f6"; // blue[300] - softer blue
      case "error":
      default:
        return "#e57373"; // red[300] - softer red
    }
  }

  getTextColor(severity) {
    // Using contrasting colors that work well with softer backgrounds
    switch (severity) {
      case "success":
        return "#2e7d32"; // green[800] - dark green for contrast
      case "warning":
        return "#e65100"; // orange[900] - dark orange for contrast
      case "info":
        return "#1565c0"; // blue[800] - dark blue for contrast
      case "error":
      default:
        return "#c62828"; // red[800] - dark red for contrast
    }
  }

  clearAll() {
    this.toasts.forEach((toastId) => this.removeToast(toastId));
  }
}

// Export singleton instance
export const toast = new ToastManager();

// React component for MUI integration (optional)
export const Toast = ({
  open,
  message,
  severity = "error",
  onClose,
  ...props
}) => (
  <Portal>
    <Snackbar
      open={open}
      autoHideDuration={ToastManager.defaultDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      style={{ zIndex: 10000 }}
      {...props}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  </Portal>
);

export default Toast;
