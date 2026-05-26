import { useEffect, useRef, useState } from "react";
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
import { loadSubjectDashboard } from "../../reducers/subjectDashboardReducer";
import Breadcrumbs from "../../components/Breadcrumbs";
import AttendanceService from "../../services/AttendanceService";
import FollowUpConfirmationDialog from "./FollowUpConfirmationDialog";
import { prettyDate } from "./utils/dates";

const AttendanceDidntHappenView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const groupSubjectUUID = searchParams.get("uuid");
  const attendanceTypeUUID = searchParams.get("attendanceTypeUuid");
  const scheduledDate = searchParams.get("date");
  const sessionUuid = searchParams.get("sessionUuid");
  const isEdit = !!sessionUuid;

  const subjectProfile = useSelector(
    (state) => state.dataEntry.subjectProfile.subjectProfile,
  );

  const [attendanceType, setAttendanceType] = useState(null);
  const [reasonAnswers, setReasonAnswers] = useState([]);
  const [reasonConceptUUID, setReasonConceptUUID] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveResponse, setSaveResponse] = useState(null);

  useEffect(() => {
    if (!groupSubjectUUID) return;
    if (!subjectProfile || subjectProfile.uuid !== groupSubjectUUID) {
      dispatch(loadSubjectDashboard(groupSubjectUUID));
    }
  }, [dispatch, groupSubjectUUID, subjectProfile]);

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
        setAttendanceType(
          (list || []).find((x) => x.uuid === attendanceTypeUUID) || null,
        );
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
    const sessUuid = attendanceType?.config?.sessionOutcomeReasonConcept;
    // Clear before re-fetching so a switch to a type without
    // sessionOutcomeReasonConcept doesn't leave the previous answers stale.
    setReasonAnswers([]);
    if (!sessUuid) return;
    AttendanceService.getConcept(sessUuid)
      .then((c) =>
        setReasonAnswers(
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
      .catch(() => setReasonAnswers([]));
  }, [attendanceType?.config]);

  // React Router reuses the same component instance across query-param
  // navigations (e.g. clicking Edit on a different didnt-happen session
  // from the sheet). Clear all URL-derived state so the load effect's
  // early-exit path on a missing match doesn't leave the previous URL's
  // reason+notes in place to get submitted against the new URL params.
  useEffect(() => {
    setReasonConceptUUID(null);
    setNotes("");
    setAttendanceType(null);
    setAttendanceTypeLoaded(false);
    setSaving(false);
    setSaveError(null);
    setSaveResponse(null);
  }, [groupSubjectUUID, attendanceTypeUUID, scheduledDate, sessionUuid]);

  // Pre-populate edit fields from the existing session.
  useEffect(() => {
    if (!isEdit || !groupSubjectUUID || !scheduledDate) return;
    let cancelled = false;
    AttendanceService.listSessions(
      groupSubjectUUID,
      scheduledDate,
      scheduledDate,
    )
      .then((list) => {
        if (cancelled) return;
        const match = (list || []).find((s) => s.uuid === sessionUuid);
        if (match) {
          setReasonConceptUUID(match.reasonConceptUUID || null);
          setNotes(match.notes || "");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isEdit, groupSubjectUUID, scheduledDate, sessionUuid]);

  // Track live URL params via a ref so save-resolution closures can detect
  // mid-flight navigation to a different didnt-happen flow and silently
  // drop their state updates — see AttendanceMarkView for full rationale.
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

  const goBack = (toast) => {
    navigate(
      `/app/subject/attendance?uuid=${encodeURIComponent(urlParamsRef.current.groupSubjectUUID)}`,
      { state: toast ? { toast } : undefined },
    );
  };

  const canSave = !!reasonConceptUUID && !saving;

  // useRef in-flight flag — see AttendanceMarkView for rationale.
  const saveInFlight = useRef(false);
  const onSave = () => {
    if (!canSave || saveInFlight.current) return;
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
      status: "DidntHappen",
      reasonConceptUUID,
      notes: notes || null,
    };
    const op = isEdit
      ? AttendanceService.updateSession(sessionUuid, payload)
      : AttendanceService.saveSession(payload);
    op.then((response) => {
      saveInFlight.current = false;
      if (!isStillSameUrl()) return;
      setSaving(false);
      const voided = response?.voidedStaleFollowUps || [];
      const skipped = response?.skippedAlreadyFilledFollowUps || [];
      const warnings = response?.warnings || [];
      if (voided.length || skipped.length || warnings.length) {
        setSaveResponse({ response, warnings });
      } else {
        goBack("Saved");
      }
    }).catch((err) => {
      saveInFlight.current = false;
      if (!isStillSameUrl()) return;
      setSaving(false);
      setSaveError(
        err?.response?.data?.message || err?.message || "Failed to save",
      );
    });
  };

  // If the attendance-type list resolved but didn't contain the URL's uuid
  // (stale link, voided type) — show an error instead of a forever spinner.
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
  if (!subjectForUrl || !attendanceType) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
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
            onClick={() => goBack()}
          >
            {"Cancel"}
          </Button>
          <Box sx={{ ml: 1 }}>
            <Typography variant="h6">
              {attendanceType.name} — {"Didn't happen"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {prettyDate(scheduledDate)} · {subjectForUrl.firstName}{" "}
              {subjectForUrl.lastName || ""}
              {isEdit ? " · " + "Editing" : ""}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use this when the class was scheduled but didn't run — pick a
            reason.
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {"Reason (required)"}
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 0.5, mb: 2 }}>
            <Select
              value={reasonConceptUUID || ""}
              displayEmpty
              onChange={(e) => setReasonConceptUUID(e.target.value || null)}
            >
              <MenuItem value="">
                <em>{"Select a reason"}</em>
              </MenuItem>
              {reasonAnswers.map((a) => (
                <MenuItem key={a.uuid} value={a.uuid}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary">
            {"Notes (optional)"}
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
            disabled={!canSave}
            onClick={onSave}
            fullWidth
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Paper>

      <FollowUpConfirmationDialog
        open={!!saveResponse}
        result={saveResponse?.response}
        warnings={saveResponse?.warnings}
        onClose={() => {
          setSaveResponse(null);
          goBack("Saved");
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

export default AttendanceDidntHappenView;
