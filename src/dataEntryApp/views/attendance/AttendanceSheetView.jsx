import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { loadSubjectDashboard } from "../../reducers/subjectDashboardReducer";
import Breadcrumbs from "../../components/Breadcrumbs";
import AttendanceService from "../../services/AttendanceService";
import { buildDayStatusMap, DAY_TYPES } from "./utils/dayResolver";
import {
  lastNDaysIncludingToday,
  todayIso,
  parseISO,
  isFutureIso,
  prettyDate,
} from "./utils/dates";
import { debounce } from "lodash";
import HorizontalDateStrip from "./HorizontalDateStrip";
import DayStatusBanner from "./DayStatusBanner";
import AttendanceTypePicker from "./AttendanceTypePicker";
import MarkAnywayConfirmDialog from "./MarkAnywayConfirmDialog";
import VoidConfirmDialog from "./VoidConfirmDialog";
import FollowUpConfirmationDialog from "./FollowUpConfirmationDialog";

const STRIP_DAYS = 14;

const SESSION_STATUS = { HELD: "Held", DIDNT_HAPPEN: "DidntHappen" };

// Build Map<isoDate, {heldCount, didntHappenCount}> from a flat list of sessions.
function buildSessionSummaryByDate(sessions) {
  const map = new Map();
  (sessions || []).forEach((s) => {
    if (!s || s.voided) return;
    const iso = String(s.scheduledDate).slice(0, 10);
    const bucket = map.get(iso) || { heldCount: 0, didntHappenCount: 0 };
    if (s.status === SESSION_STATUS.HELD) bucket.heldCount += 1;
    if (s.status === SESSION_STATUS.DIDNT_HAPPEN) bucket.didntHappenCount += 1;
    map.set(iso, bucket);
  });
  return map;
}

// For the selected date only — build Map<attendanceTypeUUID, info> where
// info = {session, presentCount, totalCount, reasonName}.
function buildSessionByTypeForDate(sessions, dateIso) {
  const map = new Map();
  (sessions || []).forEach((s) => {
    if (!s || s.voided) return;
    const iso = String(s.scheduledDate).slice(0, 10);
    if (iso !== dateIso) return;
    const presentCount = (s.roster || []).filter(
      (r) => r.status === "Present" && !r.voided,
    ).length;
    const totalCount = (s.roster || []).filter((r) => !r.voided).length;
    map.set(s.attendanceTypeUUID, {
      session: s,
      presentCount,
      totalCount,
      reasonName: s.reasonName || null,
    });
  });
  return map;
}

const AttendanceSheetView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const groupSubjectUUID = searchParams.get("uuid");

  const subjectProfile = useSelector(
    (state) => state.dataEntry.subjectProfile.subjectProfile,
  );

  const [attendanceTypes, setAttendanceTypes] = useState(null); // null while loading
  const [calendar, setCalendar] = useState(undefined); // undefined=loading, null=none
  const [markers, setMarkers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [markAnywayAcknowledgedDate, setMarkAnywayAcknowledgedDate] =
    useState(null);
  const [markAnywayPrompt, setMarkAnywayPrompt] = useState(null); // {attendanceType?, action?}
  const [pendingVoid, setPendingVoid] = useState(null); // {attendanceType, session}
  const [voidResult, setVoidResult] = useState(null); // last response for follow-ups dialog
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // When the URL's subject uuid changes mid-mount (back-button between two
  // groups, etc.), wipe stale calendar/markers/sessions/selectedDate so the
  // first frame after subjectProfile catches up doesn't render the previous
  // subject's indicators. attendanceTypes/calendar reset to "loading"
  // sentinels so the spinner gate fires until fresh fetches resolve.
  useEffect(() => {
    setAttendanceTypes(null);
    setCalendar(undefined);
    setMarkers([]);
    setSessions([]);
    setSelectedDate(todayIso());
    setMarkAnywayAcknowledgedDate(null);
    setMarkAnywayPrompt(null);
    setPendingVoid(null);
    setVoidResult(null);
    setLoadError(null);
  }, [groupSubjectUUID]);

  // Subject dashboard reducer already drives subjectProfile loading from
  // SubjectDashboard.jsx. We dispatch the same loader so deep-link / refresh
  // works without first visiting the dashboard. The uuid-mismatch guard
  // covers the "viewed subject A, then deep-linked to subject B" case where
  // the cached subjectProfile would otherwise be A.
  useEffect(() => {
    if (!groupSubjectUUID) return;
    if (!subjectProfile || subjectProfile.uuid !== groupSubjectUUID) {
      dispatch(loadSubjectDashboard(groupSubjectUUID));
    }
  }, [dispatch, groupSubjectUUID, subjectProfile]);

  // Only treat subjectProfile as authoritative once it matches the URL uuid;
  // otherwise we'd render subject A's gates while sessions/calendar APIs are
  // hit with B's uuid.
  const subjectForUrl =
    subjectProfile && subjectProfile.uuid === groupSubjectUUID
      ? subjectProfile
      : null;
  const subjectTypeUUID = subjectForUrl?.subjectType?.uuid;

  // AttendanceTypes per Subject Type. Refetch when subject type changes.
  useEffect(() => {
    if (!subjectTypeUUID) return;
    let cancelled = false;
    AttendanceService.listAttendanceTypes(subjectTypeUUID)
      .then((list) => {
        if (cancelled) return;
        setAttendanceTypes(
          (list || [])
            .filter((at) => !at.voided)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        // Keep attendanceTypes at null on error — the loadError-gated panel
        // earlier in render will fire before the loading spinner branch.
        // (Don't flip to [] here, or the "no attendance types configured"
        // copy fires falsely on a network failure.)
        setLoadError(err?.message || "Failed to load attendance types");
      });
    return () => {
      cancelled = true;
    };
  }, [subjectTypeUUID]);

  // Server-side resolved calendar. 404 → null → "no calendar configured"
  // edge case.
  useEffect(() => {
    if (!groupSubjectUUID) return;
    let cancelled = false;
    AttendanceService.resolveCalendarForSubject(groupSubjectUUID)
      .then((cal) => {
        if (!cancelled) setCalendar(cal);
      })
      .catch((err) => {
        if (!cancelled) {
          setCalendar(null);
          setLoadError(err?.message || "Failed to resolve calendar");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [groupSubjectUUID]);

  // Anchor the 14-day strip on a piece of state so it refreshes across
  // midnight (long-lived tab), on window focus (returning from another tab),
  // or on a minute-level interval poll (active-tab case where no focus event
  // fires). Without this, stripDates is frozen at mount and a save made
  // "today" after midnight wouldn't appear because the to-boundary still
  // points at yesterday.
  const [stripAnchor, setStripAnchor] = useState(() => todayIso());
  useEffect(() => {
    const refresh = () => {
      const now = todayIso();
      setStripAnchor((prev) => (prev === now ? prev : now));
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const intervalId = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      clearInterval(intervalId);
    };
  }, []);
  const stripDates = useMemo(
    () => lastNDaysIncludingToday(STRIP_DAYS),
    [stripAnchor],
  );

  // Markers for every distinct year touched by the 14-day strip OR the
  // currently selected date (Jump-to-date may sit in a different year).
  // Markers are fetched per-year on the server; collect them all into a flat
  // list so the dayResolver sees the union. Declared after stripDates so the
  // deps array doesn't hit a Temporal Dead Zone reference.
  useEffect(() => {
    if (!calendar) return;
    let cancelled = false;
    const years = new Set(stripDates.map((iso) => parseISO(iso).getFullYear()));
    if (selectedDate) years.add(parseISO(selectedDate).getFullYear());
    Promise.all(
      Array.from(years).map((y) =>
        AttendanceService.listMarkers(calendar.uuid, y).catch(() => []),
      ),
    ).then((perYear) => {
      if (!cancelled) setMarkers(perYear.flat());
    });
    return () => {
      cancelled = true;
    };
  }, [calendar?.uuid, stripDates, selectedDate]);

  // Keep a ref the debounced-fetch closure compares against to know whether
  // the user has since switched subjects.
  const groupSubjectUUIDRef = useRef(groupSubjectUUID);
  useEffect(() => {
    groupSubjectUUIDRef.current = groupSubjectUUID;
  }, [groupSubjectUUID]);

  // Native <input type="date"> fires onChange on every keystroke as the user
  // types year/month/day. Debounce the out-of-strip fetch so we don't issue
  // an interleaved request per digit; AddressLevelSinglePicker uses the same
  // useMemo(debounce, [...]) idiom. The owner-uuid closure + ref comparison
  // prevent a previous subject's response from leaking into the new
  // subject's state when the user navigates mid-flight.
  const fetchOutOfStripSessions = useMemo(() => {
    const ownerUUID = groupSubjectUUID;
    return debounce((iso) => {
      if (!ownerUUID || !iso) return;
      AttendanceService.listSessions(ownerUUID, iso, iso)
        .then((extra) => {
          if (ownerUUID !== groupSubjectUUIDRef.current) return;
          setSessions((prev) => {
            const byUuid = new Map();
            [...(prev || []), ...(extra || [])].forEach((s) => {
              if (s?.uuid) byUuid.set(s.uuid, s);
            });
            return Array.from(byUuid.values());
          });
        })
        .catch(() => {});
    }, 300);
  }, [groupSubjectUUID]);
  useEffect(
    () => () => fetchOutOfStripSessions.cancel(),
    [fetchOutOfStripSessions],
  );
  const reloadSessions = useCallback(() => {
    if (!groupSubjectUUID) return Promise.resolve([]);
    const ownerUUID = groupSubjectUUID;
    const from = stripDates[0];
    const to = stripDates[stripDates.length - 1];
    return AttendanceService.listSessions(ownerUUID, from, to)
      .then((list) => {
        if (ownerUUID !== groupSubjectUUIDRef.current) return [];
        setSessions(list || []);
        return list || [];
      })
      .catch((err) => {
        if (ownerUUID !== groupSubjectUUIDRef.current) return [];
        setLoadError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load sessions",
        );
        return [];
      });
  }, [groupSubjectUUID, stripDates]);

  useEffect(() => {
    reloadSessions();
  }, [reloadSessions]);

  // Surface a "session voided" message arriving via navigation state from the
  // MARK / DIDN'T HAPPEN sub-routes' save flow.
  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      // Clear the navigation state so refresh doesn't show it again.
      navigate(location.pathname + location.search, {
        replace: true,
        state: {},
      });
      reloadSessions();
    }
  }, [location, navigate, reloadSessions]);

  const dayStatusMap = useMemo(() => {
    const base = buildDayStatusMap(calendar, markers, stripDates);
    const sessionSummary = buildSessionSummaryByDate(sessions);
    const merged = new Map();
    stripDates.forEach((iso) => {
      merged.set(iso, {
        ...base.get(iso),
        sessionSummary: sessionSummary.get(iso) || null,
      });
    });
    return merged;
  }, [calendar, markers, sessions, stripDates]);

  const selectedDayStatus = dayStatusMap.get(selectedDate);
  const sessionByType = useMemo(
    () => buildSessionByTypeForDate(sessions, selectedDate),
    [sessions, selectedDate],
  );

  const onMark = (attendanceType) => {
    navigate(
      `/app/subject/attendanceMark?uuid=${encodeURIComponent(
        groupSubjectUUID,
      )}&attendanceTypeUuid=${encodeURIComponent(
        attendanceType.uuid,
      )}&date=${selectedDate}`,
    );
  };

  const onDidntHappen = (attendanceType) => {
    navigate(
      `/app/subject/attendanceDidntHappen?uuid=${encodeURIComponent(
        groupSubjectUUID,
      )}&attendanceTypeUuid=${encodeURIComponent(
        attendanceType.uuid,
      )}&date=${selectedDate}`,
    );
  };

  const onEdit = (attendanceType, session) => {
    const route =
      session.status === SESSION_STATUS.DIDNT_HAPPEN
        ? "attendanceDidntHappen"
        : "attendanceMark";
    navigate(
      `/app/subject/${route}?uuid=${encodeURIComponent(
        groupSubjectUUID,
      )}&attendanceTypeUuid=${encodeURIComponent(
        attendanceType.uuid,
      )}&date=${selectedDate}&sessionUuid=${encodeURIComponent(session.uuid)}`,
    );
  };

  const onVoid = (attendanceType, session) =>
    setPendingVoid({ attendanceType, session });

  const onVoidConfirm = () => {
    const session = pendingVoid?.session;
    setPendingVoid(null);
    if (!session?.uuid) return;
    AttendanceService.voidSession(session.uuid)
      .then((response) => {
        const voidedCount = response?.voidedStaleFollowUps?.length || 0;
        const skippedCount =
          response?.skippedAlreadyFilledFollowUps?.length || 0;
        const parts = ["Session voided"];
        if (voidedCount)
          parts.push(
            `${voidedCount} follow-up${voidedCount === 1 ? "" : "s"} voided`,
          );
        if (skippedCount)
          parts.push(
            `${skippedCount} follow-up${skippedCount === 1 ? "" : "s"} left (already filled)`,
          );
        setToast(parts.join(" · "));
        if (voidedCount || skippedCount) setVoidResult(response);
        reloadSessions();
      })
      .catch((err) => {
        setToast(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to void session",
        );
      });
  };

  const onMarkAnyway = () => {
    setMarkAnywayPrompt({ attendanceType: null });
  };

  const onMarkAnywayForType = (attendanceType) => {
    setMarkAnywayPrompt({ attendanceType });
  };

  const onMarkAnywayConfirm = () => {
    setMarkAnywayAcknowledgedDate(selectedDate);
    const at = markAnywayPrompt?.attendanceType;
    setMarkAnywayPrompt(null);
    if (at) onMark(at);
  };

  // Loading / error guards
  if (!groupSubjectUUID) {
    return <Box sx={{ p: 3 }}>Missing subject UUID.</Box>;
  }
  // Surface a hard error state (with a retry hint) instead of an indefinite
  // spinner if any of the three required loads failed before resolving.
  if (
    loadError &&
    (!subjectForUrl || calendar === undefined || attendanceTypes === null)
  ) {
    return (
      <Paper sx={{ m: 3, p: 3 }}>
        <Alert severity="error">{loadError} — refresh to retry.</Alert>
      </Paper>
    );
  }
  if (!subjectForUrl || calendar === undefined || attendanceTypes === null) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!subjectForUrl.subjectType?.attendanceEnabled) {
    return (
      <Paper sx={{ m: 3, p: 3 }}>
        <Typography>
          Attendance is not enabled for this subject type.
        </Typography>
      </Paper>
    );
  }
  if (attendanceTypes.length === 0) {
    return (
      <Paper sx={{ m: 3, p: 3 }}>
        <Alert severity="warning">
          No attendance types are configured for this subject type. Add one
          under App Designer → Subject Types → Attendance.
        </Alert>
      </Paper>
    );
  }
  if (!calendar) {
    return (
      <Paper sx={{ m: 3, p: 3 }}>
        <Alert severity="warning">
          No calendar configured for this class. Configure a calendar in App
          Designer → Calendars before marking attendance.
        </Alert>
      </Paper>
    );
  }

  return (
    <>
      <Breadcrumbs path={location.pathname} />
      <Paper sx={{ m: 3, p: 0 }}>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            size="small"
            onClick={() =>
              navigate(
                `/app/subject?uuid=${encodeURIComponent(groupSubjectUUID)}`,
              )
            }
          >
            {"Back to subject"}
          </Button>
          <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
            {"Attendance"} · {subjectForUrl.firstName}{" "}
            {subjectForUrl.lastName || ""}
          </Typography>
          <TextField
            type="date"
            size="small"
            label="Jump to date"
            value={selectedDate || ""}
            onChange={(e) => {
              const iso = e.target.value;
              if (!iso) return;
              if (isFutureIso(iso)) return;
              setSelectedDate(iso);
              setMarkAnywayAcknowledgedDate(null);
              if (!stripDates.includes(iso)) {
                fetchOutOfStripSessions(iso);
              }
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: todayIso() }}
            sx={{ width: 170 }}
          />
        </Box>
        <HorizontalDateStrip
          dates={stripDates}
          selectedDate={selectedDate}
          statusByDate={dayStatusMap}
          onSelect={(iso) => {
            setSelectedDate(iso);
            setMarkAnywayAcknowledgedDate(null);
          }}
        />
        <DayStatusBanner
          dayType={selectedDayStatus?.dayType}
          marker={selectedDayStatus?.marker}
          dateIso={selectedDate}
          onMarkAnyway={
            selectedDayStatus?.dayType === DAY_TYPES.WORKING_OVERRIDE
              ? null
              : onMarkAnyway
          }
        />
        {selectedDate && selectedDate < todayIso() && (
          <Alert severity="info" sx={{ mx: 2, my: 1 }}>
            {`Marking retroactively for ${prettyDate(selectedDate)}`}
          </Alert>
        )}
        <AttendanceTypePicker
          attendanceTypes={attendanceTypes}
          sessionByType={sessionByType}
          dayType={selectedDayStatus?.dayType}
          markAnywayAcknowledged={
            markAnywayAcknowledgedDate === selectedDate ||
            // Any saved session for this date counts as an implicit ack.
            Array.from(sessionByType.values()).some((info) => info.session)
          }
          onMark={onMark}
          onDidntHappen={onDidntHappen}
          onEdit={onEdit}
          onVoid={onVoid}
          onMarkAnywayForType={onMarkAnywayForType}
        />
      </Paper>

      <MarkAnywayConfirmDialog
        open={!!markAnywayPrompt}
        dateIso={selectedDate}
        onCancel={() => setMarkAnywayPrompt(null)}
        onConfirm={onMarkAnywayConfirm}
      />

      <VoidConfirmDialog
        open={!!pendingVoid}
        attendanceTypeName={pendingVoid?.attendanceType?.name}
        onCancel={() => setPendingVoid(null)}
        onConfirm={onVoidConfirm}
      />

      <FollowUpConfirmationDialog
        open={!!voidResult}
        result={voidResult}
        onClose={() => setVoidResult(null)}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        message={toast || ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {loadError && (
        <Snackbar
          open
          autoHideDuration={6000}
          onClose={() => setLoadError(null)}
        >
          <Alert severity="error" onClose={() => setLoadError(null)}>
            {loadError}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default AttendanceSheetView;
