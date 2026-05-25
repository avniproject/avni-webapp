import { Fragment } from "react";
import { Checkbox, Box, Typography, Tooltip } from "@mui/material";
import { Calendar } from "openchs-models";
import {
  DAY_KEYS_MON_FIRST,
  expandPatternValue,
  simplifyOccurrences,
} from "./utils/workingPatternFormatter";

const OCCURRENCES = [1, 2, 3, 4, 5];

const DAY_LABELS = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export function patternToOccurrenceMap(pattern) {
  const source = pattern || Calendar.defaultWorkingPattern;
  const map = {};
  DAY_KEYS_MON_FIRST.forEach((key) => {
    map[key] = expandPatternValue(source[key]);
  });
  return map;
}

export function occurrenceMapToPattern(map) {
  const pattern = {};
  DAY_KEYS_MON_FIRST.forEach((key) => {
    pattern[key] = simplifyOccurrences(map[key] || []);
  });
  return pattern;
}

const WorkingPatternEditor = ({ value, onChange }) => {
  const map = value || patternToOccurrenceMap(Calendar.defaultWorkingPattern);

  const toggle = (dayKey, occurrence) => {
    const current = map[dayKey] || [];
    const next = current.includes(occurrence)
      ? current.filter((o) => o !== occurrence)
      : [...current, occurrence].sort((a, b) => a - b);
    onChange({ ...map, [dayKey]: next });
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Weekly working pattern
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: "block" }}
      >
        Tick the week-of-month occurrences (1st through 5th) on which each
        weekday is a working day.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto repeat(5, 48px)",
          alignItems: "center",
          columnGap: 1,
          rowGap: 0.5,
        }}
      >
        <Box />
        {OCCURRENCES.map((o) => (
          <Tooltip key={`h-${o}`} title={`Week-of-month ${o}`}>
            <Typography
              variant="caption"
              sx={{ textAlign: "center", fontWeight: 600 }}
            >
              {o}
            </Typography>
          </Tooltip>
        ))}
        {DAY_KEYS_MON_FIRST.map((dayKey) => (
          <Fragment key={dayKey}>
            <Typography variant="body2" sx={{ pr: 1, fontWeight: 600 }}>
              {DAY_LABELS[dayKey]}
            </Typography>
            {OCCURRENCES.map((o) => (
              <Checkbox
                key={`${dayKey}-${o}`}
                size="small"
                checked={(map[dayKey] || []).includes(o)}
                onChange={() => toggle(dayKey, o)}
              />
            ))}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default WorkingPatternEditor;
