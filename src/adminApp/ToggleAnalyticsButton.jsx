import { useState, Fragment } from "react";
import {
  useNotify,
  useRedirect,
  useResourceContext,
  useRecordContext,
  Button
} from "react-admin";
import { CircularProgress } from "@mui/material";
import EtlJobService from "./service/etl/EtlJobService";

const ToggleAnalyticsButton = () => {
  const [busy, setBusy] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  const notify = useNotify();
  const redirect = useRedirect();
  const resource = useResourceContext();
  const record = useRecordContext(); // assumes button is rendered inside a RecordContextProvider

  if (!record) return null;

  const handleClick = async () => {
    setBusy(true);

    try {
      const toggleFn = record.analyticsDataSyncActive
        ? EtlJobService.disableJob
        : EtlJobService.createOrEnableJob;

      await toggleFn(record.uuid, resource);
      setActionCompleted(true);
    } catch (error) {
      notify(error?.message || "Error toggling analytics sync", {
        type: "error"
      });
    } finally {
      setBusy(false);
    }
  };

  if (actionCompleted) {
    redirect(`/admin/${resource}/${record.id}/show`);
    return null;
  }

  const label = record.analyticsDataSyncActive ? "Disable" : "Enable";

  return (
    <Fragment>
      <Button
        disabled={busy}
        onClick={handleClick}
        label={`${label} - Analytics Data Sync`}
        variant="contained"
      >
        {busy && <CircularProgress size={16} />}
      </Button>
    </Fragment>
  );
};

export default ToggleAnalyticsButton;
