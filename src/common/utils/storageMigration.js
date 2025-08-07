/**
 * Storage Migration Utility
 * Handles complete localStorage clearing between app versions
 */

// Change this version when you deploy and need to force localStorage clearing
const CURRENT_APP_VERSION = "2.0.1";
const VERSION_KEY = "avni_app_version";

export const handleStorageMigration = () => {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (!storedVersion || storedVersion !== CURRENT_APP_VERSION) {
      console.log(`App version updated: ${storedVersion || "unknown"} -> ${CURRENT_APP_VERSION}`);

      // Clear all localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear any auth cookies if they exist
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      // Set the new version
      localStorage.setItem(VERSION_KEY, CURRENT_APP_VERSION);

      console.log("Storage cleared for app compatibility - users will need to log in again");

      // Show user-friendly notification
      showMigrationNotice();

      return true; // Migration occurred
    }

    return false; // No migration needed
  } catch (error) {
    console.error("Error during storage migration:", error);
    // Fallback: clear everything anyway
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(VERSION_KEY, CURRENT_APP_VERSION);
      showMigrationNotice();
    } catch (fallbackError) {
      console.error("Fallback storage clear failed:", fallbackError);
    }
    return true;
  }
};

const showMigrationNotice = () => {
  // Only show if DOM is available
  if (typeof document === "undefined") return;

  const showNotice = () => {
    const notice = document.createElement("div");
    notice.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1976d2;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      max-width: 320px;
      line-height: 1.4;
    `;
    notice.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <strong>App Updated!</strong><br>
          Please log in again to continue.
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          margin-left: 8px;
        ">×</button>
      </div>
    `;
    document.body.appendChild(notice);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notice.parentElement) {
        notice.parentElement.removeChild(notice);
      }
    }, 8000);
  };

  // Show notice after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showNotice);
  } else {
    showNotice();
  }
};

export const getCurrentVersion = () => CURRENT_APP_VERSION;
export const getStoredVersion = () => localStorage.getItem(VERSION_KEY);
