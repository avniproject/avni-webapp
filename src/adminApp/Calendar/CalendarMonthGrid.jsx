import { Box, Tooltip, Typography } from "@mui/material";
import { format } from "date-fns";
import { Calendar } from "openchs-models";
import {
  daysInMonth,
  monthName,
  mondayFirstDayIndex,
  MON_FIRST_DAY_LABELS,
} from "./utils/monthGrid";

const CELL_SIZE = 32;

const stateStyles = {
  [Calendar.dayType.WORKING_DAY]: {
    backgroundColor: "transparent",
    color: "text.primary",
  },
  [Calendar.dayType.WEEKLY_OFF]: {
    backgroundColor: "#F1F2F4",
    color: "text.secondary",
  },
  [Calendar.dayType.PUBLIC_HOLIDAY]: {
    backgroundColor: "transparent",
    color: "text.primary",
  },
  [Calendar.dayType.WORKING_OVERRIDE]: {
    backgroundColor: "transparent",
    color: "text.primary",
  },
};

const Dot = ({ color }) => (
  <Box
    component="span"
    sx={{
      display: "inline-block",
      width: 6,
      height: 6,
      borderRadius: "50%",
      backgroundColor: color,
      position: "absolute",
      bottom: 4,
      left: "50%",
      transform: "translateX(-50%)",
    }}
  />
);

const CalendarMonthGrid = ({
  year,
  monthIndex,
  calendar,
  markers,
  markerByDate,
  highlightedDate,
  onCellClick,
}) => {
  const total = daysInMonth(year, monthIndex);
  const firstOfMonth = new Date(year, monthIndex, 1);
  const leadingBlanks = mondayFirstDayIndex(firstOfMonth);

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(
      <Box key={`blank-${i}`} sx={{ width: CELL_SIZE, height: CELL_SIZE }} />,
    );
  }
  for (let day = 1; day <= total; day++) {
    const date = new Date(year, monthIndex, day);
    const iso = format(date, "yyyy-MM-dd");
    const dayType = calendar.dayType(iso, markers);
    const marker = markerByDate[iso];
    const styles = stateStyles[dayType] || {};
    const isHighlighted = highlightedDate === iso;

    const fireCellClick = (target) =>
      onCellClick({ date, iso, dayType, marker, target });
    const cell = (
      <Box
        key={iso}
        role="button"
        tabIndex={0}
        data-cell-iso={iso}
        onClick={(e) => fireCellClick(e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fireCellClick(e.currentTarget);
          }
        }}
        sx={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          borderRadius: 0.5,
          fontSize: 13,
          outline: isHighlighted ? "2px solid #1976d2" : "none",
          "&:hover": { backgroundColor: "rgba(25,118,210,0.08)" },
          ...styles,
        }}
      >
        {day}
        {dayType === Calendar.dayType.PUBLIC_HOLIDAY && <Dot color="#D32F2F" />}
        {dayType === Calendar.dayType.WORKING_OVERRIDE && (
          <Dot color="#2E7D32" />
        )}
      </Box>
    );

    cells.push(
      marker ? (
        <Tooltip
          key={`tip-${iso}`}
          title={`${marker.name} (${marker.isWorking ? "Working" : "Off"})`}
        >
          {cell}
        </Tooltip>
      ) : (
        cell
      ),
    );
  }

  return (
    <Box sx={{ p: 1.5, border: "1px solid #E5E5E5", borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {monthName(monthIndex)} {year}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
          columnGap: 0.25,
          rowGap: 0.25,
        }}
      >
        {MON_FIRST_DAY_LABELS.map((label) => (
          <Typography
            key={label}
            variant="caption"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            {label}
          </Typography>
        ))}
        {cells}
      </Box>
    </Box>
  );
};

export default CalendarMonthGrid;
