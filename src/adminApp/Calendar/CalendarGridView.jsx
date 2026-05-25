import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Typography,
  Alert,
  MenuItem,
  Select,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
} from "@mui/icons-material";
import { Title } from "react-admin";
import { parseISO } from "date-fns";
import { Calendar, Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import CalendarService from "./CalendarService";
import CalendarMonthGrid from "./CalendarMonthGrid";
import CalendarMarkerPopover from "./CalendarMarkerPopover";
import AddMarkerDialog from "./AddMarkerDialog";
import { extractServerErrorMessage } from "./utils/errorMessage";

const HIGHLIGHT_DURATION_MS = 2500;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR - 3; y <= CURRENT_YEAR + 5; y++) {
  YEAR_OPTIONS.push(y);
}

function buildMarkerByDate(markers) {
  const map = {};
  (markers || []).forEach((m) => {
    if (m && !m.voided && m.markerDate) {
      const iso = String(m.markerDate).slice(0, 10);
      map[iso] = m;
    }
  });
  return map;
}

const Legend = () => (
  <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box sx={{ width: 16, height: 16, border: "1px solid #ccc" }} />
      <Typography variant="caption">Working day</Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        sx={{
          width: 16,
          height: 16,
          backgroundColor: "#F1F2F4",
          border: "1px solid #ccc",
        }}
      />
      <Typography variant="caption">Weekly off</Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#D32F2F",
        }}
      />
      <Typography variant="caption">Public holiday</Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#2E7D32",
        }}
      />
      <Typography variant="caption">Working override</Typography>
    </Box>
  </Box>
);

const CalendarGridView = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.app.userInfo);
  const canManage = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.ManageCalendars,
  );

  const [calendarRow, setCalendarRow] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [popover, setPopover] = useState(null);
  const [addMarkerOpen, setAddMarkerOpen] = useState(false);
  const [highlightedDate, setHighlightedDate] = useState(null);
  // When the Add-Marker dialog detects a duplicate-date conflict and the user
  // clicks "Edit existing marker", we set this to the conflicting iso. After
  // markers/year settle, an effect looks up the cell by data-cell-iso and
  // opens the popover anchored to it.
  const [pendingOpenIso, setPendingOpenIso] = useState(null);
  // The Add-Marker-from-button path fetches markers explicitly so it can set the
  // highlight after they land. When the picked date is in a different year, we
  // also flip `year`, which would normally re-trigger the year-effect's fetch —
  // this ref skips that one redundant fetch.
  const skipNextMarkerLoadRef = useRef(false);

  const calendarEntity = useMemo(() => {
    if (!calendarRow) return null;
    return Calendar.fromResource({
      ...calendarRow,
      workingPattern: calendarRow.workingPattern,
    });
  }, [calendarRow]);

  const markerByDate = useMemo(() => buildMarkerByDate(markers), [markers]);

  useEffect(() => {
    if (!canManage) return;
    setLoading(true);
    setLoadError(null);
    CalendarService.get(uuid)
      .then(setCalendarRow)
      .catch((err) => {
        setLoadError(
          extractServerErrorMessage(err, "Failed to load calendar."),
        );
      })
      .finally(() => setLoading(false));
  }, [uuid, canManage]);

  const loadMarkers = useCallback(() => {
    if (!uuid) return Promise.resolve([]);
    return CalendarService.listMarkers(uuid, year).then((list) => {
      setMarkers(list);
      return list;
    });
  }, [uuid, year]);

  useEffect(() => {
    if (!canManage) return;
    if (skipNextMarkerLoadRef.current) {
      skipNextMarkerLoadRef.current = false;
      return;
    }
    loadMarkers();
  }, [year, canManage, loadMarkers]);

  useEffect(() => {
    if (!highlightedDate) return;
    const t = setTimeout(() => setHighlightedDate(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(t);
  }, [highlightedDate]);

  // When a pendingOpenIso is set, open the popover anchored to that date's
  // cell. Effects run after React commits, so by the time this fires the new
  // year's grid (if we just switched) is already in the DOM.
  useEffect(() => {
    if (!pendingOpenIso || !calendarEntity) return;
    const el = document.querySelector(`[data-cell-iso="${pendingOpenIso}"]`);
    if (!el) {
      console.warn(
        `Calendar grid: cell for ${pendingOpenIso} not found in DOM; ` +
          `popover can't be anchored.`,
      );
      setPendingOpenIso(null);
      return;
    }
    const dayType = calendarEntity.dayType(pendingOpenIso, markers);
    const marker = markerByDate[pendingOpenIso] || null;
    setPopover({ anchor: el, dateIso: pendingOpenIso, dayType, marker });
    setPendingOpenIso(null);
  }, [pendingOpenIso, calendarEntity, markers, markerByDate]);

  const handleCellClick = ({ iso, dayType, marker, target }) => {
    setPopover({
      anchor: target,
      dateIso: iso,
      dayType,
      marker: marker || null,
    });
  };

  const handleSaveMarker = ({ name, isWorking, dateIso, marker }) => {
    if (marker) {
      return CalendarService.updateMarker(marker.uuid, {
        uuid: marker.uuid,
        calendarUUID: uuid,
        markerDate: dateIso,
        name,
        isWorking,
        voided: false,
      }).then(() => {
        setHighlightedDate(dateIso);
        return loadMarkers();
      });
    }
    return CalendarService.createMarker({
      calendarUUID: uuid,
      markerDate: dateIso,
      name,
      isWorking,
      voided: false,
    }).then(() => {
      setHighlightedDate(dateIso);
      return loadMarkers();
    });
  };

  const handleDeleteMarker = (marker) =>
    CalendarService.removeMarker(marker.uuid).then(() => loadMarkers());

  const handleAddMarkerFromButton = ({ name, isWorking, dateIso }) => {
    return CalendarService.createMarker({
      calendarUUID: uuid,
      markerDate: dateIso,
      name,
      isWorking,
      voided: false,
    }).then(() => {
      const pickedYear = parseISO(dateIso).getFullYear();
      if (pickedYear !== year) {
        skipNextMarkerLoadRef.current = true;
        setYear(pickedYear);
      }
      return CalendarService.listMarkers(uuid, pickedYear).then((list) => {
        setMarkers(list);
        setHighlightedDate(dateIso);
      });
    });
  };

  // Called when the AddMarkerDialog detected a duplicate-date conflict and the
  // user clicked "Edit existing marker". Bring the conflict date into view
  // (switch year if necessary, reload markers there), then queue the popover
  // to open anchored to that cell as soon as it's in the DOM.
  const handleEditExistingMarker = (dateIso) => {
    const pickedYear = parseISO(dateIso).getFullYear();
    const ensureMarkers =
      pickedYear === year
        ? Promise.resolve(markers)
        : CalendarService.listMarkers(uuid, pickedYear).then((list) => {
            setMarkers(list);
            skipNextMarkerLoadRef.current = true;
            setYear(pickedYear);
            return list;
          });
    ensureMarkers.then(() => setPendingOpenIso(dateIso));
  };

  const handleSetDefault = () => {
    CalendarService.setDefault(uuid)
      .then(setCalendarRow)
      .catch((err) => {
        alert(
          extractServerErrorMessage(err, "Failed to set as default calendar."),
        );
      });
  };

  if (!canManage) {
    return (
      <Box sx={{ p: 3 }}>You do not have permission to manage calendars.</Box>
    );
  }

  if (loading || !calendarRow || !calendarEntity) {
    return (
      <Box sx={{ p: 3 }}>
        {loadError ? (
          <Alert severity="error">{loadError}</Alert>
        ) : (
          <CircularProgress size={24} />
        )}
      </Box>
    );
  }

  const isGlobalMode = !calendarRow.addressLevelUUID;

  return (
    <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
      <Title title={`Calendar — ${calendarRow.name}`} />
      <Grid
        container
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Grid sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate("/appdesigner/calendar")}
          >
            Back to calendars
          </Button>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {calendarRow.name}
          </Typography>
          {isGlobalMode ? (
            <Chip label="GLOBAL" size="small" color="primary" />
          ) : (
            <Chip
              label={
                calendarRow.addressLevelName ||
                calendarRow.addressLevel ||
                "Per-location"
              }
              size="small"
            />
          )}
          {isGlobalMode && calendarRow.isDefault && (
            <Chip label="DEFAULT" size="small" color="success" />
          )}
        </Grid>
        <Grid sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isGlobalMode && (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(calendarRow.isDefault)}
                  onChange={() => {
                    if (!calendarRow.isDefault) handleSetDefault();
                  }}
                  disabled={Boolean(calendarRow.isDefault)}
                />
              }
              label="Set as default"
            />
          )}
          <IconButton
            size="small"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Previous year"
          >
            <ChevronLeft />
          </IconButton>
          <Select
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEAR_OPTIONS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            size="small"
            onClick={() => setYear((y) => y + 1)}
            aria-label="Next year"
          >
            <ChevronRight />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setAddMarkerOpen(true)}
          >
            Add Marker
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ mb: 2 }}>
        <Legend />
      </Box>
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, monthIndex) => (
          <Grid key={monthIndex} sx={{ flex: "0 0 auto" }}>
            <CalendarMonthGrid
              year={year}
              monthIndex={monthIndex}
              calendar={calendarEntity}
              markers={markers}
              markerByDate={markerByDate}
              highlightedDate={highlightedDate}
              onCellClick={handleCellClick}
            />
          </Grid>
        ))}
      </Grid>
      <CalendarMarkerPopover
        open={Boolean(popover)}
        anchorEl={popover?.anchor}
        dateIso={popover?.dateIso}
        dayType={popover?.dayType}
        marker={popover?.marker}
        onClose={() => setPopover(null)}
        onSave={handleSaveMarker}
        onDelete={handleDeleteMarker}
      />
      <AddMarkerDialog
        open={addMarkerOpen}
        onClose={() => setAddMarkerOpen(false)}
        onSave={handleAddMarkerFromButton}
        onEditExisting={handleEditExistingMarker}
      />
    </Box>
  );
};

export default CalendarGridView;
