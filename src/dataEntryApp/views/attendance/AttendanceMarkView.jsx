import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  loadSubjectDashboard,
  getGroupMembers,
} from "../../reducers/subjectDashboardReducer";
import Breadcrumbs from "../../components/Breadcrumbs";
import AttendanceService from "../../services/AttendanceService";
import RosterRow from "./RosterRow";
import FollowUpConfirmationDialog from "./FollowUpConfirmationDialog";
import { buildDayStatusMap, isHolidayLike } from "./utils/dayResolver";
import { prettyDate, parseISO } from "./utils/dates";

const AttendanceMarkView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const groupSubjectUUID = searchParams.get("uuid");
  const attendanceTypeUUID = searchParams.get("attendanceTypeUuid");
  const scheduledDate = searchParams.get("date");
  const sessionUuid = searchParams.get("sessionUuid"); // null when creating
  const isEdit = !!sessionUuid;

  const subjectProfile = useSelector(
    (state) => state.dataEntry.subjectProfile.subjectProfile,
  );
  const groupMembers = useSelector(
    (state) => state.dataEntry.subjectProfile.groupMembers,
  );

  const [attendanceType, setAttendanceType] = useState(null);
  const [absenceReasonAnswers, setAbsenceReasonAnswers] = useState([]);
  const [sessionOutcomeReasonAnswers, setSessionOutcomeReasonAnswers] =
    useState([]);
  const [existingSession, setExistingSession] = useState(null);
  const [calendar, setCalendar] = useState(undefined);
  const [markers, setMarkers] = useState([]);
  const [roster, setRoster] = useState([]); // [{subjectUUID, name, status, reasonConceptUUIDs}]
  const [notes, setNotes] = useState("");
  const [sessionReasonConceptUUID, setSessionReasonConceptUUID] =
    useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveResponse, setSaveResponse] = useState(null);

  useEffect(() => {
    if (!groupSubjectUUID) return;
    // uuid-mismatch guard: if the cached subjectProfile is for a different
    // subject (deep-link / back-button), force a reload so we don't fetch
    // attendance types for the wrong subject type.
    if (!subjectProfile || subjectProfile.uuid !== groupSubjectUUID) {
      dispatch(loadSubjectDashboard(groupSubjectUUID));
    }
    dispatch(getGroupMembers(groupSubjectUUID));
  }, [dispatch, groupSubjectUUID, subjectProfile]);

  // Only treat subjectProfile as authoritative once it matches the URL uuid.
  const subjectForUrl =
    subjectProfile && subjectProfile.uuid === groupSubjectUUID
      ? subjectProfile
      : null;
  const subjectTypeUUID = subjectForUrl?.subjectType?.uuid;

  const [attendanceTypeLoaded, setAttendanceTypeLoaded] = useState(false);
  useEffect(() => {
    if (!subjectTypeUUID || !attendanceTypeUUID) return;
    let cancelled = false;
    AttendanceService.listAttendanceTypes(subjectTypeUUID)
      .then((list) => {
        if (cancelled) return;
        const at = (list || []).find((x) => x.uuid === attendanceTypeUUID);
        setAttendanceType(at || null);
      })
      .catch(() => {
        if (!cancelled) setAttendanceType(null);
      })
      .finally(() => {
        if (!cancelled) setAttendanceTypeLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectTypeUUID, attendanceTypeUUID]);

  useEffect(() => {
    if (!groupSubjectUUID) return;
    AttendanceService.resolveCalendarForSubject(groupSubjectUUID)
      .then(setCalendar)
      .catch(() => setCalendar(null));
  }, [groupSubjectUUID]);

  useEffect(() => {
    if (!calendar || !scheduledDate) return;
    // parseISO from date-fns treats "YYYY-MM-DD" as local midnight, so
    // getFullYear() gives the right year in every timezone. `new Date(iso)`
    // would parse as UTC midnight and shift the year in negative-offset TZs.
    const year = parseISO(scheduledDate).getFullYear();
    AttendanceService.listMarkers(calendar.uuid, year)
      .then(setMarkers)
      .catch(() => setMarkers([]));
  }, [calendar?.uuid, scheduledDate]);

  useEffect(() => {
    const config = attendanceType?.config;
    if (!config) return;
    const absUuid = config.absenceReasonConcept;
    const sessUuid = config.sessionOutcomeReasonConcept;
    // Clear before re-fetching so a switch from "type A has reasonX" to
    // "type B has no reason" doesn't keep A's options in the dropdown.
    setAbsenceReasonAnswers([]);
    setSessionOutcomeReasonAnswers([]);
    if (absUuid) {
      AttendanceService.getConcept(absUuid)
        .then((c) =>
          setAbsenceReasonAnswers(
            (c?.conceptAnswers || [])
              .filter(
                (a) => !a.voided && a.answerConcept && !a.answerConcept.voided,
              )
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((a) => ({
                uuid: a.answerConcept.uuid,
                name: a.answerConcept.name,
              })),
          ),
        )
        .catch(() => setAbsenceReasonAnswers([]));
    }
    if (sessUuid) {
      AttendanceService.getConcept(sessUuid)
        .then((c) =>
          setSessionOutcomeReasonAnswers(
            (c?.conceptAnswers || [])
              .filter(
                (a) => !a.voided && a.answerConcept && !a.answerConcept.voided,
              )
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((a) => ({
                uuid: a.answerConcept.uuid,
                name: a.answerConcept.name,
              })),
          ),
        )
        .catch(() => setSessionOutcomeReasonAnswers([]));
    }
  }, [attendanceType?.config]);

  // Existing session (Edit path) — fetch from the same date-range endpoint
  // so we don't need a new server route.
  useEffect(() => {
    if (!isEdit || !groupSubjectUUID || !scheduledDate) return;
    AttendanceService.listSessions(
      groupSubjectUUID,
      scheduledDate,
      scheduledDate,
    )
      .then((list) => {
        const match = (list || []).find((s) => s.uuid === sessionUuid);
        if (match) {
          setExistingSession(match);
          setNotes(match.notes || "");
          setSessionReasonConceptUUID(match.reasonConceptUUID || null);
        }
      })
      .catch(() => {});
  }, [isEdit, groupSubjectUUID, scheduledDate, sessionUuid]);

  // Build the roster from group members + (when editing) pre-populate
  // per-student status / reason from the existing AttendanceRecords.
  // `groupMembers` is the array of GroupSubject mappings from
  // mapGroupMembers — each carries `memberSubject` (Individual with `name`
  // already set by `mapIndividual`).
  // Roster init runs at most once per mount. Edit mode waits for both
  // groupMembers AND existingSession so user-toggled Absents don't get wiped
  // when existingSession resolves after the first roster build.
  const rosterInitialised = useRef(false);
  // React Router reuses the same component instance across query-param
  // navigations (e.g. clicking Edit on a different session from the sheet).
  // Clear the ref + reset everything keyed off the URL params so the screen
  // re-renders to its loading state and re-fetches against the new URL
  // instead of flashing the previous URL's data while the new fetches are
  // in-flight.
  useEffect(() => {
    rosterInitialised.current = false;
    setExistingSession(null);
    setRoster([]);
    setNotes("");
    setSessionReasonConceptUUID(null);
    setAttendanceType(null);
    setAttendanceTypeLoaded(false);
    setCalendar(undefined);
    setMarkers([]);
    setSaving(false);
    setSaveError(null);
    setSaveResponse(null);
  }, [groupSubjectUUID, attendanceTypeUUID, scheduledDate, sessionUuid]);
  useEffect(() => {
    if (rosterInitialised.current) return;
    if (!Array.isArray(groupMembers)) return;
    if (isEdit && !existingSession) return;
    const members = groupMembers
      .filter((gs) => !gs.voided && gs.memberSubject)
      .map((gs) => ({
        subjectUUID: gs.memberSubject.uuid,
        name: gs.memberSubject.name || gs.memberSubject.nameString || "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (isEdit && existingSession?.roster) {
      const recordBySubject = new Map();
      (existingSession.roster || []).forEach((r) => {
        if (!r.voided) recordBySubject.set(r.subjectUUID, r);
      });
      setRoster(
        members.map((m) => {
          const rec = recordBySubject.get(m.subjectUUID);
          return {
            ...m,
            status: rec?.status || "Present",
            reasonConceptUUIDs:
              rec?.reasonConceptUUIDs ||
              (rec?.reasonConceptUUID ? [rec.reasonConceptUUID] : []),
          };
        }),
      );
    } else {
      setRoster(
        members.map((m) => ({
          ...m,
          status: "Present",
          reasonConceptUUIDs: [],
        })),
      );
    }
    rosterInitialised.current = true;
  }, [groupMembers, isEdit, existingSession]);

  const dayType = useMemo(() => {
    if (!calendar || !scheduledDate) return null;
    const map = buildDayStatusMap(calendar, markers, [scheduledDate]);
    return map.get(scheduledDate)?.dayType || null;
  }, [calendar, markers, scheduledDate]);

  const holidayMode = isHolidayLike(dayType);
  const reasonMissing = !sessionReasonConceptUUID;
  const saveDisabled = saving || (holidayMode && reasonMissing);

  const onTogglePresence = useCallback((subjectUUID) => {
    setRoster((prev) =>
      prev.map((r) =>
        r.subjectUUID === subjectUUID
          ? {
              ...r,
              status: r.status === "Present" ? "Absent" : "Present",
              // Clear reasons if flipping back to Present.
              reasonConceptUUIDs:
                r.status === "Present" ? r.reasonConceptUUIDs : [],
            }
          : r,
      ),
    );
  }, []);

  const onSetReason = useCallback((subjectUUID, reasonConceptUUIDs) => {
    setRoster((prev) =>
      prev.map((r) =>
        r.subjectUUID === subjectUUID ? { ...r, reasonConceptUUIDs } : r,
      ),
    );
  }, []);

  const onMarkAllAbsent = () => {
    setRoster((prev) => prev.map((r) => ({ ...r, status: "Absent" })));
  };

  // Track the live URL params via a ref so save-resolution closures can
  // detect that the user has navigated to a different attendance flow
  // mid-flight (back + Edit on a different session) and silently drop their
  // state updates — preventing a stale dialog from rendering over the new
  // screen and preventing goBack() from teleporting them to the wrong
  // subject's sheet.
  const urlParamsRef = useRef({
    groupSubjectUUID,
    attendanceTypeUUID,
    scheduledDate,
    sessionUuid,
  });
  useEffect(() => {
    urlParamsRef.current = {
      groupSubjectUUID,
      attendanceTypeUUID,
      scheduledDate,
      sessionUuid,
    };
  }, [groupSubjectUUID, attendanceTypeUUID, scheduledDate, sessionUuid]);

  // useRef in-flight flag, not `saving` state: state updates haven't
  // committed by the time a rapid second click fires onClick, so two POSTs
  // can land for the same {group, date, attendanceType} before saveDisabled
  // recomputes. Refs flip synchronously.
  const saveInFlight = useRef(false);
  const onSave = () => {
    if (saveDisabled || saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setSaveError(null);
    const requestParams = {
      groupSubjectUUID,
      attendanceTypeUUID,
      scheduledDate,
      sessionUuid,
    };
    const isStillSameUrl = () => {
      const cur = urlParamsRef.current;
      return (
        cur.groupSubjectUUID === requestParams.groupSubjectUUID &&
        cur.attendanceTypeUUID === requestParams.attendanceTypeUUID &&
        cur.scheduledDate === requestParams.scheduledDate &&
        cur.sessionUuid === requestParams.sessionUuid
      );
    };
    const payload = {
      ...(isEdit ? { uuid: sessionUuid } : {}),
      groupSubjectUUID,
      scheduledDate,
      attendanceTypeUUID,
      status: "Held",
      reasonConceptUUID: holidayMode ? sessionReasonConceptUUID : null,
      notes: notes || null,
      roster: roster.map((r) => ({
        subjectUUID: r.subjectUUID,
        status: r.status,
        reasonConceptUUIDs: r.status === "Absent" ? r.reasonConceptUUIDs : [],
      })),
    };
    const op = isEdit
      ? AttendanceService.updateSession(sessionUuid, payload)
      : AttendanceService.saveSession(payload);
    op.then((response) => {
      saveInFlight.current = false;
      if (!isStillSameUrl()) return;
      setSaving(false);
      const created = response?.autoCreatedFollowUps || [];
      const voided = response?.voidedStaleFollowUps || [];
      const skipped = response?.skippedAlreadyFilledFollowUps || [];
      const warnings = response?.warnings || [];
      if (
        created.length ||
        voided.length ||
        skipped.length ||
        warnings.length
      ) {
        setSaveResponse({ response, warnings });
      } else {
        goBack("Attendance saved");
      }
    }).catch((err) => {
      saveInFlight.current = false;
      if (!isStillSameUrl()) return;
      setSaving(false);
      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save attendance",
      );
    });
  };

  const goBack = (toast) => {
    navigate(
      `/app/subject/attendance?uuid=${encodeURIComponent(urlParamsRef.current.groupSubjectUUID)}`,
      { state: toast ? { toast } : undefined },
    );
  };

  // If the attendance-type list resolved but didn't contain the URL's uuid
  // (stale link, voided type, wrong subject) — surface that instead of the
  // forever-spinner.
  if (attendanceTypeLoaded && !attendanceType) {
    return (
      <Paper sx={{ m: 3, p: 3 }}>
        <Alert severity="error">
          Attendance type not found. It may have been voided. Go back and pick
          another type.
        </Alert>
      </Paper>
    );
  }
  if (!subjectForUrl || !attendanceType || !groupMembers) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const summary = roster.reduce(
    (acc, r) => {
      if (r.status === "Absent") {
        if (r.reasonConceptUUIDs?.length) acc.withReason += 1;
        else acc.withoutReason += 1;
      }
      return acc;
    },
    { withReason: 0, withoutReason: 0 },
  );

  return (
    <>
      <Breadcrumbs path={location.pathname} />
      <Paper sx={{ m: 3, p: 0 }}>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            size="small"
            onClick={() => goBack()}
          >
            {"Cancel"}
          </Button>
          <Box sx={{ ml: 1 }}>
            <Typography variant="h6">{attendanceType.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {prettyDate(scheduledDate)} · {subjectForUrl.firstName}{" "}
              {subjectForUrl.lastName || ""}
              {isEdit ? " · " + "Editing" : ""}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1,
            backgroundColor: "#FAFAFA",
            borderTop: "1px solid #EEE",
            borderBottom: "1px solid #EEE",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {"Tap a row to toggle present/absent"}
          </Typography>
          <Button size="small" onClick={onMarkAllAbsent}>
            {"Mark all absent"}
          </Button>
        </Box>
        {roster.map((row, index) => (
          <RosterRow
            key={row.subjectUUID}
            row={row}
            index={index}
            reasonAnswers={absenceReasonAnswers}
            followUpEncounterTypeUuid={
              attendanceType.config?.followUpEncounterType
            }
            onTogglePresence={onTogglePresence}
            onSetReason={onSetReason}
          />
        ))}
        <Box sx={{ p: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 2 }}
          >
            {`${summary.withReason} absent with reason · ${summary.withoutReason} absent without reason`}
          </Typography>

          {holidayMode && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Session reason (required for holiday-mode mark)
              </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select
                  value={sessionReasonConceptUUID || ""}
                  displayEmpty
                  onChange={(e) =>
                    setSessionReasonConceptUUID(e.target.value || null)
                  }
                >
                  <MenuItem value="">
                    <em>{"Select a reason"}</em>
                  </MenuItem>
                  {sessionOutcomeReasonAnswers.map((a) => (
                    <MenuItem key={a.uuid} value={a.uuid}>
                      {a.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            {"Session notes (optional)"}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 0.5, mb: 2 }}
          />

          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            disabled={saveDisabled}
            onClick={onSave}
            fullWidth
          >
            {saving ? "Saving..." : "Save attendance"}
          </Button>
        </Box>
      </Paper>

      <FollowUpConfirmationDialog
        open={!!saveResponse}
        result={saveResponse?.response}
        warnings={saveResponse?.warnings}
        onClose={() => {
          setSaveResponse(null);
          goBack("Attendance saved");
        }}
      />

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
        message={saveError || ""}
      />
    </>
  );
};

export default AttendanceMarkView;
