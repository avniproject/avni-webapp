import { Box, Button, Chip, Typography } from "@mui/material";
import { isHolidayLike } from "./utils/dayResolver";

const STATUS = { HELD: "Held", DIDNT_HAPPEN: "DidntHappen" };

// One row per AttendanceType for the selected date. Status of the row is
// derived from sessionByType (the saved Session for that {date, type} pair,
// if any). For non-working dayTypes the row shows "Class not in session"
// with a Mark-anyway action unless the parent has already acknowledged the
// banner.
const AttendanceTypePicker = ({
  attendanceTypes,
  sessionByType,
  dayType,
  markAnywayAcknowledged,
  onMark,
  onDidntHappen,
  onEdit,
  onVoid,
  onMarkAnywayForType,
}) => {
  const holidayLikeUnacknowledged =
    isHolidayLike(dayType) && !markAnywayAcknowledged;

  return (
    <Box>
      {attendanceTypes.map((at) => (
        <Row
          key={at.uuid}
          attendanceType={at}
          info={sessionByType.get(at.uuid) || { session: null }}
          holidayLikeUnacknowledged={holidayLikeUnacknowledged}
          onMark={onMark}
          onDidntHappen={onDidntHappen}
          onEdit={onEdit}
          onVoid={onVoid}
          onMarkAnywayForType={onMarkAnywayForType}
        />
      ))}
    </Box>
  );
};

const Row = ({
  attendanceType,
  info,
  holidayLikeUnacknowledged,
  onMark,
  onDidntHappen,
  onEdit,
  onVoid,
  onMarkAnywayForType,
}) => {
  const { session } = info;
  const isHeld = session && session.status === STATUS.HELD;
  const isDidntHappen = session && session.status === STATUS.DIDNT_HAPPEN;

  const statusLine = !session ? (
    <Typography variant="body2" color="text.secondary">
      {"Not marked yet"}
    </Typography>
  ) : isHeld ? (
    <Typography variant="body2" sx={{ color: "success.main" }}>
      ✓ {`${info.presentCount ?? "?"} of ${info.totalCount ?? "?"} present`}
    </Typography>
  ) : isDidntHappen ? (
    <Typography variant="body2" color="text.disabled">
      ⊘ {`Didn't happen — ${info.reasonName || ""}`}
    </Typography>
  ) : null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        py: 2,
        px: 2,
        borderBottom: "1px solid #E5E5E5",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {attendanceType.name}
        </Typography>
        {statusLine}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {!session && holidayLikeUnacknowledged && (
          <>
            <Chip
              label={"Class not in session"}
              size="small"
              variant="outlined"
            />
            <Button
              size="small"
              onClick={() => onMarkAnywayForType(attendanceType)}
            >
              {"Mark anyway"}
            </Button>
          </>
        )}
        {!session && !holidayLikeUnacknowledged && (
          <>
            <Button
              size="small"
              variant="contained"
              onClick={() => onMark(attendanceType)}
            >
              Mark attendance
            </Button>
            <Button size="small" onClick={() => onDidntHappen(attendanceType)}>
              {"Didn't happen"}
            </Button>
          </>
        )}
        {session && (
          <>
            <Button
              size="small"
              onClick={() => onEdit(attendanceType, session)}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => onVoid(attendanceType, session)}
            >
              Delete
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AttendanceTypePicker;
