import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../../../dataEntryApp/ErrorFallback";

/**
 * Error boundary wrapper specifically for Template Application Dialog
 * Provides error handling and user feedback for template application failures
 */
export const TemplateDialogErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} onClose={resetErrorBoundary} />
      )}
      onError={(error, errorInfo) => {
        console.error("Template Dialog Error:", error, errorInfo);
        // Could add error reporting service here
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
