import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import * as api from "./api";
import FhirBundleView from "./FhirBundleView";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

// The privileges the server opens the page's status to (AbdmAdminController). openchs-models does not name the ABDM two.
const PAGE_PRIVILEGES = [
  Privilege.PrivilegeType.EditOrganisationConfiguration,
  "ShareAbdmRecords",
  "ViewAbdmRecords",
];

// The page is for organisations that switched ABHA and record sharing on, and users holding any of PAGE_PRIVILEGES.
export const canOpenAbdm = (userInfo, organisationConfig) =>
  !!userInfo &&
  !!organisationConfig?.enableAbha &&
  !!organisationConfig?.enableAbdmRecordSharing &&
  PAGE_PRIVILEGES.some((privilegeType) =>
    UserInfo.hasPrivilege(userInfo, privilegeType),
  );

// NHA's pattern for an ABHA address. A bare name is allowed; the server adds the environment's suffix and checks it.
export const isAbhaAddress = (value) =>
  /^[a-zA-Z0-9][a-zA-Z0-9_.]+[a-zA-Z0-9](@[a-z]+)?$/.test((value || "").trim());

// The purposes Eka carries (EkaHiuService.PURPOSES) and the eight record types NHA defines.
const PURPOSES = [
  ["CAREMGT", "Care management"],
  ["PATRQT", "Self requested"],
  ["PUBHLTH", "Public health"],
  ["DSRCH", "Disease-specific research"],
];
const purposeText = (code) =>
  (PURPOSES.find(([c]) => c === code) || [code, code])[1];
const HI_TYPES = [
  "OPConsultation",
  "Prescription",
  "DiagnosticReport",
  "DischargeSummary",
  "ImmunizationRecord",
  "HealthDocumentRecord",
  "WellnessRecord",
  "Invoice",
];
// A consent the patient withdrew, refused or that expired: no records are shown, and those received are erased.
const ENDED = {
  REVOKED:
    "No records: the patient withdrew this consent. Records received under it are erased.",
  EXPIRED:
    "No records: this consent has expired. Records received under it are erased.",
  DENIED: "No records: the patient refused this consent.",
};

const msg = (e) => api.errorMessage(e);
const statusColor = (s) =>
  s === "LINKED" ||
  s === "GRANTED" ||
  s === "APPROVED" ||
  s === "COMPLETED" ||
  s === "TRANSFERRED"
    ? "success"
    : s === "FAILED" || s === "FAILED_FINAL" || s === "DENIED" || s === "ERROR"
      ? "error"
      : "default";
const yesNo = (v) => (v ? "Yes" : "No");
const StatusChip = ({ status }) => (
  <Chip size="small" label={status || "-"} color={statusColor(status)} />
);
const FINAL = [
  "GRANTED",
  "DENIED",
  "FAILED",
  "EXPIRED",
  "REVOKED",
  "COMPLETED",
  "ERROR",
  "APPROVED",
];
const isFinal = (r) => FINAL.includes(r.status);
const dayOffset = (d) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
};
// Server times are UTC; shown in Indian time, to match the app and the records.
const day = (t) => {
  const d = t ? new Date(t) : null;
  if (!d || isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
const fmt = (t) => {
  const d = t ? new Date(t) : null;
  if (!d || isNaN(d.getTime())) return t ? String(t) : "";
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });
};

// Patients approve, withdraw and link from their own app, and the server links on a schedule: tabs that show those
// refresh themselves this often.
const REFRESH_MS = 10000;

// The quick poll after a consent request gives up after this long; the slow refresh carries on.
const QUICK_POLL_MAX_MS = 2 * 60 * 1000;
// The server's patient list stops here (AbdmHipStore).
export const HIP_LIST_LIMIT = 500;

// Polls fn every ms while shouldContinue(result) holds, up to maxMs (0 = no limit).
const usePoll = () => {
  const timer = useRef(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      window.clearTimeout(timer.current);
    };
  }, []);
  return useCallback((fn, ms, shouldContinue, maxMs) => {
    window.clearTimeout(timer.current);
    const start = Date.now();
    const tick = async () => {
      let again = false;
      try {
        again = shouldContinue(await fn());
      } catch {
        again = false;
      }
      if (alive.current && again && (!maxMs || Date.now() - start < maxMs))
        timer.current = window.setTimeout(tick, ms);
    };
    tick();
  }, []);
};

// Whether the browser tab is in view, so a refresh nobody can see is not asked for.
const usePageVisible = () => {
  const [visible, setVisible] = useState(
    () => document.visibilityState !== "hidden",
  );
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
};

// Names for what the status counts, in the words of the people who read it, in the order a visit goes through them; an
// unknown one shows as the server sent it, after these.
const QUEUE_TEXT = {
  PENDING: "Being prepared",
  QUEUED: "Waiting to be sent",
  LINK_REQUESTED: "Sent, waiting for Eka",
  FAILED: "Failed, will try again",
  AWAITING_VERIFIED_ABHA: "Waiting for the patient's ABHA to be verified",
  FAILED_FINAL: "Given up",
  LINKED: "Linked",
};
const QUEUE_ORDER = Object.keys(QUEUE_TEXT);
const queueRank = (status) =>
  QUEUE_ORDER.includes(status)
    ? QUEUE_ORDER.indexOf(status)
    : QUEUE_ORDER.length;
const JOB_TEXT = {
  visitLinking: "Linking visits",
  consentExpiry: "Expiring consents",
  consentUpdateRetry: "Retrying consent updates",
  trafficPurge: "Clearing old traffic",
};
const jobText = (job) => {
  const success = job.lastSuccessAt
    ? `Last success ${fmt(job.lastSuccessAt)}`
    : "Never succeeded";
  return job.lastError ? `${success}. Last error: ${job.lastError}` : success;
};

export const StatusTab = ({ status, error, onRequeued }) => {
  const [requeued, setRequeued] = useState(null);
  const [requeueErr, setRequeueErr] = useState(null);
  const [requeueing, setRequeueing] = useState(false);
  // Read at the click, so a second click before the button greys out sends nothing.
  const requeueOut = useRef(false);
  const queue = Object.entries((status && status.queue) || {}).sort(
    ([a], [b]) => queueRank(a) - queueRank(b),
  );
  const jobs = Object.entries((status && status.jobs) || {});
  const requeue = () => {
    if (requeueOut.current) return;
    requeueOut.current = true;
    setRequeueing(true);
    setRequeued(null);
    setRequeueErr(null);
    api
      .requeueFailed()
      .then((r) => {
        setRequeued(r.requeued);
        if (onRequeued) onRequeued();
      })
      .catch((e) => setRequeueErr(msg(e)))
      .finally(() => {
        requeueOut.current = false;
        setRequeueing(false);
      });
  };
  const table = (list) => (
    <Table size="small" style={{ maxWidth: 700, marginBottom: 16 }}>
      <TableBody>
        {list.map(([k, v]) => (
          <TableRow key={k}>
            <TableCell>{k}</TableCell>
            <TableCell>{v}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  return (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      {status && (
        <>
          {!status.recordSharingOn && (
            <Alert severity="warning" style={{ marginBottom: 16 }}>
              ABDM record sharing is not working for this organisation yet. The
              rows below show what is missing.
            </Alert>
          )}
          {table([
            ["ABHA", yesNo(status.abhaEnabled)],
            ["Record sharing switched on", yesNo(status.recordSharingEnabled)],
            ["Record sharing working", yesNo(status.recordSharingOn)],
            ["Receiving records (HIU)", yesNo(status.hiuOn)],
            ["Eka environment", status.environment],
            ["HIP IDs", (status.hipIds || []).join(", ")],
            ["HIU ID", status.hiuId],
            ["Sharing client set up", yesNo(status.sharingClientConfigured)],
            ["Webhook URL (give to Eka)", status.webhookUrl],
            [
              "Eka session",
              status.session &&
                (status.session.ok
                  ? "OK"
                  : `Not OK: ${status.session.error || ""}`),
            ],
          ])}
          <Typography variant="h6">Visits by link status</Typography>
          {queue.length === 0 ? (
            <Typography style={{ marginBottom: 16 }}>
              No visits are queued.
            </Typography>
          ) : (
            table(queue.map(([k, v]) => [QUEUE_TEXT[k] || k, v]))
          )}
          {/* The server refuses it (404) while record sharing is not working, privilege or not. */}
          {status.recordSharingOn &&
            status.privileges &&
            status.privileges.share && (
              <Box style={{ marginBottom: 16 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={requeue}
                  disabled={requeueing}
                >
                  Queue again the visits given up
                </Button>
                {requeued !== null && (
                  <Typography>
                    {requeued === 0
                      ? "No visits were queued again."
                      : `${requeued} ${requeued === 1 ? "visit" : "visits"} queued again.`}
                  </Typography>
                )}
                {requeueErr && <Alert severity="error">{requeueErr}</Alert>}
              </Box>
            )}
          <Typography variant="h6">Background jobs</Typography>
          {jobs.length === 0 ? (
            <Typography style={{ marginBottom: 16 }}>
              No job has run yet.
            </Typography>
          ) : (
            table(jobs.map(([k, v]) => [JOB_TEXT[k] || k, jobText(v)]))
          )}
          <Typography variant="h6">Shares</Typography>
          {table([
            ["Shares that failed", status.failedShares ?? 0],
            ["Shares Eka did not answer", status.unansweredShares ?? 0],
          ])}
        </>
      )}
    </Box>
  );
};

export const HipTab = () => {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [contexts, setContexts] = useState([]);
  const [err, setErr] = useState(null);
  const poll = usePoll();
  const loadPatients = useCallback(
    () =>
      api
        .getHipPatients()
        .then(setPatients)
        .catch((e) => setErr(msg(e))),
    [],
  );
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);
  // Saved visits are linked by the server's five-minute job (AbdmHousekeepingJob.linkQueuedVisits), not by a click
  // here, so the tab refreshes itself to show them arrive and turn LINKED; not while the browser tab is hidden, as the
  // patient list runs to 500.
  const selectedUUID = selected && selected.subjectUUID;
  const visible = usePageVisible();
  useEffect(() => {
    if (!visible) return;
    let live = true;
    const timer = window.setInterval(() => {
      loadPatients();
      if (selectedUUID)
        api
          .getCareContexts(selectedUUID)
          .then((l) => live && setContexts(l))
          .catch((e) => setErr(msg(e)));
    }, REFRESH_MS);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
  }, [loadPatients, selectedUUID, visible]);
  const pending = (list) =>
    list.some((c) => c.status === "PENDING" || c.status === "LINK_REQUESTED");
  const pollContexts = (uuid) =>
    poll(
      () =>
        api.getCareContexts(uuid).then((l) => {
          setContexts(l);
          if (!pending(l)) loadPatients();
          return l;
        }),
      2000,
      pending,
      30000,
    );
  const select = (p) => {
    setSelected(p);
    setContexts([]);
    api
      .getCareContexts(p.subjectUUID)
      .then(setContexts)
      .catch((e) => setErr(msg(e)));
  };
  const link = () => {
    setErr(null);
    api
      .linkSubject(selected.subjectUUID)
      .then((l) => {
        if (Array.isArray(l)) setContexts(l);
        pollContexts(selected.subjectUUID);
      })
      .catch((e) => setErr(msg(e)));
  };
  return (
    <Box>
      {err && (
        <Alert severity="error" onClose={() => setErr(null)}>
          {err}
        </Alert>
      )}
      <Typography variant="h6">Patients with ABHA</Typography>
      {patients.length >= HIP_LIST_LIMIT && (
        <Alert severity="info" style={{ margin: "8px 0" }}>
          Showing the first {HIP_LIST_LIMIT} patients. Others are not listed
          here.
        </Alert>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>ABHA number</TableCell>
            <TableCell>ABHA address</TableCell>
            <TableCell>Visits</TableCell>
            <TableCell>Linked</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((p) => (
            <TableRow
              key={p.subjectUUID}
              hover
              selected={selected && selected.subjectUUID === p.subjectUUID}
              onClick={() => select(p)}
              style={{ cursor: "pointer" }}
            >
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.abhaNumberMasked}</TableCell>
              <TableCell>{p.abhaAddress}</TableCell>
              <TableCell>{p.encounters}</TableCell>
              <TableCell>
                {p.linked ? (
                  <Chip size="small" color="success" label="Linked" />
                ) : (
                  <Chip size="small" label="Not linked" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selected && (
        <Box style={{ marginTop: 16 }}>
          <Typography variant="h6">Care contexts: {selected.name}</Typography>
          <Button
            variant="contained"
            onClick={link}
            style={{ margin: "8px 0" }}
          >
            Send waiting visits now
          </Button>
          <Typography variant="caption" display="block">
            Sends this patient's waiting visits to ABHA now, without waiting for
            the five-minute schedule.
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Reference</TableCell>
                <TableCell>Display</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contexts.map((c) => (
                <TableRow key={c.reference}>
                  <TableCell>{c.reference}</TableCell>
                  <TableCell>{c.display}</TableCell>
                  <TableCell>{c.hiType}</TableCell>
                  <TableCell>
                    {c.status === "QUEUED" ? (
                      <>
                        <Chip size="small" label="Queued" />{" "}
                        <Typography variant="caption">
                          links on its own within 5 minutes
                        </Typography>
                      </>
                    ) : (
                      <StatusChip status={c.status} />
                    )}
                  </TableCell>
                  <TableCell>{c.error}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export const HiuTab = ({ onViewRecords }) => {
  const [form, setForm] = useState({
    abhaAddress: "",
    from: dayOffset(-365),
    to: dayOffset(0),
    expiry: dayOffset(30),
    requesterName: "",
    requesterRegistrationNumber: "",
    purposeCode: PURPOSES[0][0],
    hiTypes: [],
  });
  const [requests, setRequests] = useState([]);
  const [err, setErr] = useState(null);
  const poll = usePoll();
  const load = useCallback(
    () =>
      api.getConsentRequests().then((l) => {
        setRequests(l);
        return l;
      }),
    [],
  );
  const startPoll = useCallback(
    () =>
      poll(load, 3000, (l) => l.some((r) => !isFinal(r)), QUICK_POLL_MAX_MS),
    [poll, load],
  );
  useEffect(() => {
    startPoll();
  }, [startPoll]);
  // A grant, refusal or withdrawal in the patient's app can come minutes later; the list keeps refreshing to show it.
  useEffect(() => {
    const timer = window.setInterval(() => {
      load().catch(() => {});
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleType = (t) => () =>
    setForm({
      ...form,
      hiTypes: form.hiTypes.includes(t)
        ? form.hiTypes.filter((x) => x !== t)
        : HI_TYPES.filter((x) => x === t || form.hiTypes.includes(x)),
    });
  const addressOk = isAbhaAddress(form.abhaAddress);
  const requesterOk =
    form.requesterName.trim() !== "" &&
    form.requesterRegistrationNumber.trim() !== "";
  const request = () => {
    setErr(null);
    api
      .createConsentRequest({
        ...form,
        abhaAddress: form.abhaAddress.trim(),
        requesterName: form.requesterName.trim(),
        requesterRegistrationNumber: form.requesterRegistrationNumber.trim(),
      })
      .then(() => load().then(startPoll))
      .catch((e) => setErr(msg(e)));
  };
  return (
    <Box>
      {err && (
        <Alert severity="error" onClose={() => setErr(null)}>
          {err}
        </Alert>
      )}
      <Paper variant="outlined" style={{ padding: 16, marginBottom: 16 }}>
        <TextField
          label="ABHA address"
          name="abhaAddress"
          size="small"
          value={form.abhaAddress}
          onChange={set("abhaAddress")}
          error={!!form.abhaAddress && !addressOk}
          helperText={
            form.abhaAddress && !addressOk
              ? "Not an ABHA address: letters, digits, '.' or '_'"
              : " "
          }
          style={{ marginRight: 8 }}
        />
        <TextField
          select
          label="Purpose"
          name="purposeCode"
          size="small"
          value={form.purposeCode}
          onChange={set("purposeCode")}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          style={{ marginRight: 8 }}
        >
          {PURPOSES.map(([code, text]) => (
            <option key={code} value={code}>
              {text}
            </option>
          ))}
        </TextField>
        <TextField
          label="From"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={form.from}
          onChange={set("from")}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={form.to}
          onChange={set("to")}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Consent expires"
          name="expiry"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={form.expiry}
          onChange={set("expiry")}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Requester name"
          name="requesterName"
          size="small"
          required
          value={form.requesterName}
          onChange={set("requesterName")}
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Requester registration number"
          name="requesterRegistrationNumber"
          size="small"
          required
          value={form.requesterRegistrationNumber}
          onChange={set("requesterRegistrationNumber")}
          style={{ marginRight: 8 }}
        />
        <Box style={{ margin: "8px 0" }}>
          <Typography variant="caption" style={{ marginRight: 8 }}>
            Record types:
          </Typography>
          {HI_TYPES.map((t) => (
            <label key={t} style={{ marginRight: 12, whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                name="hiType"
                value={t}
                checked={form.hiTypes.includes(t)}
                onChange={toggleType(t)}
              />{" "}
              {t}
            </label>
          ))}
        </Box>
        <Button
          variant="contained"
          onClick={request}
          disabled={!addressOk || !requesterOk || form.hiTypes.length === 0}
        >
          Request consent
        </Button>
      </Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Created</TableCell>
            <TableCell>Patient</TableCell>
            <TableCell>Asked for</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Consent request ID</TableCell>
            <TableCell>Artefacts</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.uuid}>
              <TableCell>{fmt(r.createdAt)}</TableCell>
              <TableCell>
                <div>{r.patientName || "Not registered here"}</div>
                {r.abhaNumber && <div>{r.abhaNumber}</div>}
                <div>{r.abhaAddress}</div>
              </TableCell>
              <TableCell>
                <div>{purposeText(r.purposeCode)}</div>
                <div>{(r.hiTypes || []).join(", ")}</div>
                <div>
                  {day(r.from)} to {day(r.to)}
                </div>
                <div>Expires {day(r.expiry)}</div>
              </TableCell>
              <TableCell>
                <StatusChip status={r.status} />
                {r.error && <div style={{ color: "#c62828" }}>{r.error}</div>}
                {(r.statusHistory || []).map((h, i) => (
                  <div key={i} style={{ fontSize: 12 }}>
                    {h.status} {fmt(h.at)}
                  </div>
                ))}
              </TableCell>
              <TableCell>{r.consentRequestId}</TableCell>
              <TableCell>
                {(r.artefacts || []).map((a) => (
                  <div key={a.consentId}>
                    {a.consentId}: {a.status} · flow {a.dataFlowStatus || "-"} ·{" "}
                    {a.records ?? 0} records
                  </div>
                ))}
              </TableCell>
              <TableCell style={{ whiteSpace: "nowrap" }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onViewRecords(r)}
                >
                  View records
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export const RecordsTab = ({ request }) => {
  const [records, setRecords] = useState(null);
  const [err, setErr] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const ended = request && ENDED[currentStatus || request.status];
  // The request list is small, so it refreshes on its own to catch a withdrawal; once the consent has ended there is
  // nothing more to catch.
  useEffect(() => {
    if (!request || ended) return;
    let live = true;
    const timer = window.setInterval(() => {
      api
        .getConsentRequests()
        .then((l) => {
          const r = l.find((x) => x.uuid === request.uuid);
          if (live && r) setCurrentStatus(r.status);
        })
        .catch(() => {});
    }, REFRESH_MS);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
  }, [request, ended]);
  useEffect(() => {
    setCurrentStatus(null);
  }, [request]);
  // Records can be large, so they are fetched once and again only on request. The cleanup of the latest fetch is kept,
  // so a slower earlier answer never lands over a newer one, nor after the tab is left.
  const cancelFetch = useRef(null);
  const fetchRecords = useCallback(() => {
    if (cancelFetch.current) cancelFetch.current();
    let live = true;
    cancelFetch.current = () => {
      live = false;
    };
    api
      .getConsentRecords(request.uuid)
      .then((r) => live && setRecords(r))
      .catch((e) => live && setErr(msg(e)));
  }, [request]);
  useEffect(() => {
    if (!request || ended) return;
    setRecords(null);
    setErr(null);
    fetchRecords();
  }, [request, ended, fetchRecords]);
  // A consent that ends drops what was received and any fetch still on its way.
  useEffect(() => {
    if (!ended) return;
    if (cancelFetch.current) cancelFetch.current();
    setRecords(null);
  }, [ended]);
  useEffect(
    () => () => {
      if (cancelFetch.current) cancelFetch.current();
    },
    [],
  );
  const refresh = () => {
    setErr(null);
    fetchRecords();
  };
  if (!request)
    return (
      <Typography>
        Pick a consent request in the "HIU · Request records" tab and press
        "View records".
      </Typography>
    );
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Records for {request.abhaAddress}
      </Typography>
      {ended && <Typography>{ended}</Typography>}
      {!ended && (
        <Button variant="outlined" size="small" onClick={refresh}>
          Refresh
        </Button>
      )}
      {err && <Alert severity="error">{err}</Alert>}
      {!ended && records && records.length === 0 && (
        <Typography>No records received yet.</Typography>
      )}
      {(ended ? [] : records || []).map((r, i) => (
        <Box key={i}>
          <Typography variant="caption">
            {r.careContextReference} · HIP {r.hipId} · received{" "}
            {fmt(r.receivedAt)} · checksum{" "}
            {r.checksumMatched === true
              ? "matched"
              : r.checksumMatched === false
                ? "NOT matched"
                : "none sent"}
          </Typography>
          <FhirBundleView bundle={r.bundle} />
        </Box>
      ))}
    </Box>
  );
};

const Abdm = () => {
  const [tab, setTab] = useState("status");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [request, setRequest] = useState(null);
  const loadStatus = useCallback(
    () =>
      api
        .getStatus()
        .then((s) => {
          setStatus(s);
          setError(null);
        })
        .catch((e) => setError(msg(e))),
    [],
  );
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  const view = (r) => {
    setRequest(r);
    setTab("records");
  };
  const sharing = !!status?.recordSharingOn && !!status?.privileges?.share;
  const receiving = !!status?.hiuOn && !!status?.privileges?.view;
  const missing = [
    status?.recordSharingOn && !sharing && "Share ABDM records",
    status?.hiuOn && !receiving && "View ABDM records",
  ].filter(Boolean);
  return (
    <Paper style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>
        ABDM
      </Typography>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab value="status" label="Status" />
        {sharing && <Tab value="hip" label="HIP · Link records" />}
        {receiving && <Tab value="hiu" label="HIU · Request records" />}
        {receiving && <Tab value="records" label="Records received" />}
      </Tabs>
      <Box style={{ paddingTop: 16 }}>
        {tab === "status" && (
          <>
            {missing.length > 0 && (
              <Alert severity="info" style={{ marginBottom: 16 }}>
                Some tabs are hidden because you lack a privilege. Ask your
                administrator for: {missing.join(", ")}.
              </Alert>
            )}
            <StatusTab status={status} error={error} onRequeued={loadStatus} />
          </>
        )}
        {tab === "hip" && sharing && <HipTab />}
        {tab === "hiu" && receiving && <HiuTab onViewRecords={view} />}
        {tab === "records" && receiving && <RecordsTab request={request} />}
      </Box>
    </Paper>
  );
};

export default Abdm;
