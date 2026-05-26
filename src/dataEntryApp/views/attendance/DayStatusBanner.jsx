import { Alert, Button } from "@mui/material";
import { DAY_TYPES, isHolidayLike } from "./utils/dayResolver";
import { prettyDate } from "./utils/dates";

// Renders for non-working day types only. On weekly_off / public_holiday the
// banner exposes a Mark-anyway action; on working_override it's an informational
// note (no action needed since the day is treated as working).
const DayStatusBanner = ({ dayType, marker, dateIso, onMarkAnyway }) => {
  if (!dayType || dayType === DAY_TYPES.WORKING_DAY) return null;

  if (dayType === DAY_TYPES.WORKING_OVERRIDE) {
    return (
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        {`${prettyDate(dateIso)} is normally a holiday but has been marked as a working day${marker?.name ? ` — ${marker.name}` : ""}.`}
      </Alert>
    );
  }

  const message =
    dayType === DAY_TYPES.PUBLIC_HOLIDAY
      ? `${prettyDate(dateIso)} is a public holiday${marker?.name ? ` — ${marker.name}` : ""}. Class is not in session.`
      : `${prettyDate(dateIso)} is a weekly off. Class is not in session.`;

  return (
    <Alert
      severity="warning"
      sx={{ borderRadius: 0 }}
      action={
        isHolidayLike(dayType) && onMarkAnyway ? (
          <Button color="inherit" size="small" onClick={onMarkAnyway}>
            {"Mark anyway"}
          </Button>
        ) : null
      }
    >
      {message}
    </Alert>
  );
};

export default DayStatusBanner;
