import { Box, Tooltip, Typography } from "@mui/material";
import { dayOfMonth, weekdayShort } from "./utils/dates";
import { DAY_TYPES } from "./utils/dayResolver";

const CELL_WIDTH = 48;

const dotStyle = (color) => ({
  display: "inline-block",
  width: 6,
  height: 6,
  borderRadius: "50%",
  backgroundColor: color,
});

const diamondStyle = (color) => ({
  display: "inline-block",
  width: 7,
  height: 7,
  backgroundColor: color,
  transform: "rotate(45deg)",
});

function renderStatusIndicator(daySummary) {
  if (!daySummary) return null;
  const { dayType, sessionSummary } = daySummary;
  if (dayType === DAY_TYPES.PUBLIC_HOLIDAY) {
    return <Box component="span" sx={dotStyle("#D32F2F")} />;
  }
  if (dayType === DAY_TYPES.WORKING_OVERRIDE) {
    return <Box component="span" sx={diamondStyle("#2E7D32")} />;
  }
  if (sessionSummary) {
    const { heldCount, didntHappenCount } = sessionSummary;
    if (heldCount > 0 && didntHappenCount > 0) {
      return (
        <Box sx={{ display: "inline-flex", gap: 0.5 }}>
          <Box component="span" sx={dotStyle("#2E7D32")} />
          <Box component="span" sx={dotStyle("#9e9e9e")} />
        </Box>
      );
    }
    if (heldCount > 0) return <Box component="span" sx={dotStyle("#2E7D32")} />;
    if (didntHappenCount > 0)
      return <Box component="span" sx={dotStyle("#9e9e9e")} />;
  }
  return null;
}

const HorizontalDateStrip = ({
  dates,
  selectedDate,
  statusByDate,
  onSelect,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        overflowX: "auto",
        gap: 1,
        py: 1,
        backgroundColor: "#FAFAFA",
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      {dates.map((iso) => {
        const summary = statusByDate?.get(iso);
        const isSelected = iso === selectedDate;
        const isWeeklyOff = summary?.dayType === DAY_TYPES.WEEKLY_OFF;
        const tooltipParts = [];
        if (summary?.dayType)
          tooltipParts.push(summary.dayType.replace("_", " "));
        if (summary?.marker?.name) tooltipParts.push(summary.marker.name);
        const cell = (
          <Box
            key={iso}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(iso)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(iso);
              }
            }}
            sx={{
              minWidth: CELL_WIDTH,
              flexShrink: 0,
              textAlign: "center",
              cursor: "pointer",
              borderRadius: 1,
              py: 1,
              px: 0.5,
              backgroundColor: isSelected
                ? "primary.main"
                : isWeeklyOff
                  ? "#F1F2F4"
                  : "transparent",
              color: isSelected ? "primary.contrastText" : "text.primary",
              border: isSelected ? "none" : "1px solid transparent",
              "&:hover": {
                backgroundColor: isSelected
                  ? "primary.dark"
                  : "rgba(0,0,0,0.04)",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{ display: "block", opacity: 0.85 }}
            >
              {weekdayShort(iso)}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
            >
              {dayOfMonth(iso)}
            </Typography>
            <Box
              sx={{
                height: 10,
                mt: 0.5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {renderStatusIndicator(summary)}
            </Box>
          </Box>
        );
        return tooltipParts.length > 0 ? (
          <Tooltip key={iso} title={tooltipParts.join(" · ")} arrow>
            {cell}
          </Tooltip>
        ) : (
          cell
        );
      })}
    </Box>
  );
};

export default HorizontalDateStrip;
