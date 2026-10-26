// DEMO-ONLY abdm-hackathon
import React, { useCallback, useEffect, useRef, useState } from "react";
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

// Only a user who may edit the organisation's configuration sees the page; the server checks the same privilege.
export const canOpenAbdm = (userInfo) =>
  !!userInfo &&
  UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.EditOrganisationConfiguration,
  );

// NHA's pattern for an ABHA address. A bare name is allowed; the server adds the environment's suffix and checks it.
export const isAbhaAddress = (value) =>
  /^[a-zA-Z0-9][a-zA-Z0-9_.]+[a-zA-Z0-9](@(sbx|abdm))?$/.test(
    (value || "").trim(),
  );

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
const Json = ({ value }) => (
  <pre
    style={{
      overflow: "auto",
      maxHeight: 360,
      background: "#f5f5f5",
      padding: 8,
    }}
  >
    {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
  </pre>
);
const statusColor = (s) =>
  s === "LINKED" ||
  s === "GRANTED" ||
  s === "APPROVED" ||
  s === "COMPLETED" ||
  s === "TRANSFERRED"
    ? "success"
    : s === "FAILED" || s === "DENIED" || s === "ERROR"
      ? "error"
      : "default";
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

// Polls fn every ms while shouldContinue(result) holds, up to maxMs (0 = no limit).
const usePoll = () => {
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
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
      if (again && (!maxMs || Date.now() - start < maxMs))
        timer.current = window.setTimeout(tick, ms);
    };
    tick();
  }, []);
};

const StatusTab = ({ status, setStatus }) => {
  const [err, setErr] = useState(null);
  const [bridge, setBridge] = useState(null);
  const [services, setServices] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  useEffect(() => {
    api
      .getStatus()
      .then(setStatus)
      .catch((e) => setErr(msg(e)));
  }, [setStatus]);
  const run = (fn, set) => () =>
    fn()
      .then((r) => set(r))
      .catch((e) => set({ error: msg(e) }));
  return (
    <Box>
      {err && <Alert severity="error">{err}</Alert>}
      {status && (
        <>
          <Alert
            severity={status.mode === "mock" ? "warning" : "success"}
            style={{ marginBottom: 16 }}
          >
            {status.mode === "mock"
              ? "Consent manager: MOCK — a local stand-in for NHA's gateway"
              : status.mode === "eka"
                ? "Eka Care ABDM Connect (sandbox) — Eka's bridge to NHA"
                : "NHA ABDM sandbox (dev.abdm.gov.in)"}
          </Alert>
          <Table size="small" style={{ maxWidth: 700 }}>
            <TableBody>
              {[
                ["Client ID", status.clientId],
                ["HIP ID", status.hipId],
                ["HIU ID", status.hiuId],
                ["Public base URL", status.publicBaseUrl],
                ["Gateway base URL", status.gatewayBaseUrl],
                ...(status.webhookUrl
                  ? [["Webhook URL (give to Eka)", status.webhookUrl]]
                  : []),
                [
                  "Gateway session",
                  status.session &&
                    (status.session.ok
                      ? "OK"
                      : `Not OK: ${status.session.error || ""}`),
                ],
              ].map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell>{k}</TableCell>
                  <TableCell>{v}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
      <Box style={{ marginTop: 16 }}>
        <Button
          variant="contained"
          onClick={run(api.registerBridgeUrl, setBridge)}
          style={{ marginRight: 8 }}
        >
          Register bridge URL
        </Button>
        <Button
          variant="outlined"
          onClick={run(api.getBridgeServices, setServices)}
        >
          Show bridge services
        </Button>
      </Box>
      {bridge && <Json value={bridge} />}
      {services && <Json value={services} />}
      <Box style={{ marginTop: 24 }}>
        {!confirmReset ? (
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              setResetResult(null);
              setConfirmReset(true);
            }}
          >
            Reset demo data
          </Button>
        ) : (
          <>
            <Typography variant="body2" style={{ marginBottom: 8 }}>
              Clears this organisation's ABDM links, consents, records received
              and traffic. Patients and visits stay.
            </Typography>
            <Button
              color="error"
              variant="contained"
              style={{ marginRight: 8 }}
              onClick={() =>
                api
                  .resetDemo()
                  .then((r) => setResetResult(`Cleared ${r.rowsDeleted} rows`))
                  .catch((e) => setResetResult(msg(e)))
                  .finally(() => setConfirmReset(false))
              }
            >
              Yes, clear it
            </Button>
            <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
          </>
        )}
        {resetResult && (
          <Typography variant="body2" style={{ marginTop: 8 }}>
            {resetResult}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const HIP_REFRESH_MS = 10000;

export const HipTab = () => {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [contexts, setContexts] = useState([]);
  const [consents, setConsents] = useState([]);
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
    api
      .getHipConsents()
      .then(setConsents)
      .catch((e) => setErr(msg(e)));
  }, [loadPatients]);
  // Saved visits are linked by the server's five-minute job (AbdmHousekeepingJob.linkQueuedVisits), not by a click
  // here, so the tab refreshes itself to show them arrive and turn LINKED.
  const selectedUUID = selected && selected.subjectUUID;
  useEffect(() => {
    let live = true;
    const timer = window.setInterval(() => {
      loadPatients();
      if (selectedUUID)
        api
          .getCareContexts(selectedUUID)
          .then((l) => live && setContexts(l))
          .catch((e) => setErr(msg(e)));
    }, HIP_REFRESH_MS);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
  }, [loadPatients, selectedUUID]);
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
            Link to ABHA
          </Button>
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
                    {c.status === "PENDING" ? (
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
      <Typography variant="h6" style={{ marginTop: 24 }}>
        Consents received (as HIP)
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Consent ID</TableCell>
            <TableCell>ABHA address</TableCell>
            <TableCell>HIU</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Types</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Data flows</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {consents.map((c) => (
            <TableRow key={c.consentId}>
              <TableCell>{c.consentId}</TableCell>
              <TableCell>{c.abhaAddress}</TableCell>
              <TableCell>{c.hiuId}</TableCell>
              <TableCell>
                <StatusChip status={c.status} />
              </TableCell>
              <TableCell>{(c.hiTypes || []).join(", ")}</TableCell>
              <TableCell>{c.dateFrom}</TableCell>
              <TableCell>{c.dateTo}</TableCell>
              <TableCell>
                {(c.dataFlows || [])
                  .map((f) => `${f.status} (${f.entries ?? 0})`)
                  .join("; ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export const HiuTab = ({ status, onViewRecords }) => {
  const [form, setForm] = useState({
    abhaAddress: "",
    from: dayOffset(-365),
    to: dayOffset(0),
    expiry: dayOffset(30),
    requesterName: "Dr. Demo",
    purposeCode: "CAREMGT",
    hiTypes: ["OPConsultation"],
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
    () => poll(load, 3000, (l) => l.some((r) => !isFinal(r))),
    [poll, load],
  );
  useEffect(() => {
    startPoll();
  }, [startPoll]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleType = (t) => () =>
    setForm({
      ...form,
      hiTypes: form.hiTypes.includes(t)
        ? form.hiTypes.filter((x) => x !== t)
        : HI_TYPES.filter((x) => x === t || form.hiTypes.includes(x)),
    });
  const addressOk = isAbhaAddress(form.abhaAddress);
  const request = () => {
    setErr(null);
    api
      .createConsentRequest({ ...form, abhaAddress: form.abhaAddress.trim() })
      .then(() => load().then(startPoll))
      .catch((e) => setErr(msg(e)));
  };
  const act = (fn, id) => () => {
    setErr(null);
    fn(id)
      .then(() => load().then(startPoll))
      .catch((e) => setErr(msg(e)));
  };
  const mock = status && status.mode === "mock";
  const eka = status && status.mode === "eka";
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
              ? "Not an ABHA address: letters, digits, '.' or '_', ending in @sbx or @abdm"
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
          label="Requester"
          size="small"
          value={form.requesterName}
          onChange={set("requesterName")}
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
          disabled={!addressOk || form.hiTypes.length === 0}
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
                {mock && r.status === "REQUESTED" && r.consentRequestId && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={act(api.approveConsent, r.consentRequestId)}
                      style={{ marginRight: 4 }}
                    >
                      Approve as patient (mock PHR app)
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={act(api.denyConsent, r.consentRequestId)}
                      style={{ marginRight: 4 }}
                    >
                      Deny
                    </Button>
                  </>
                )}
                {eka && r.status === "REQUESTED" && r.consentRequestId && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={act(api.approveConsentEka, r.consentRequestId)}
                    style={{ marginRight: 4 }}
                  >
                    Approve in Eka sandbox
                  </Button>
                )}
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
  const ended = request && ENDED[request.status];
  useEffect(() => {
    if (!request || ENDED[request.status]) return;
    setRecords(null);
    setErr(null);
    api
      .getConsentRecords(request.uuid)
      .then(setRecords)
      .catch((e) => setErr(msg(e)));
  }, [request]);
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
      {err && <Alert severity="error">{err}</Alert>}
      {!ended && records && records.length === 0 && (
        <Typography>No records received yet.</Typography>
      )}
      {(records || []).map((r, i) => (
        <Box key={i}>
          <Typography variant="caption">
            {r.careContextReference} · HIP {r.hipId} · received{" "}
            {fmt(r.receivedAt)} · checksum{" "}
            {r.checksumMatched ? "matched" : "NOT matched"}
          </Typography>
          <FhirBundleView bundle={r.bundle} />
        </Box>
      ))}
    </Box>
  );
};

// The registries answer either a list or an object holding one (facilities, professionals): the list is the table.
const resultRows = (results) => {
  if (Array.isArray(results)) return results;
  if (results && typeof results === "object")
    return Object.values(results).find(Array.isArray) || null;
  return null;
};

const SearchResult = ({ res }) => {
  if (!res) return null;
  const rows = resultRows(res.results);
  if (res.error && !rows) return <Alert severity="error">{res.error}</Alert>;
  if (rows && rows.length && typeof rows[0] === "object") {
    const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r)))).slice(
      0,
      8,
    );
    return (
      <Box style={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {cols.map((c) => (
                <TableCell key={c}>{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                {cols.map((c) => (
                  <TableCell key={c}>
                    {typeof r[c] === "object"
                      ? JSON.stringify(r[c])
                      : String(r[c] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  }
  return <Json value={res} />;
};

const FormBox = ({ title, fields, action, submitLabel, render }) => {
  const [vals, setVals] = useState({});
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const go = () => {
    setErr(null);
    setRes(null);
    const body = {};
    fields.forEach((f) => {
      if (vals[f]) body[f] = vals[f];
    });
    action(body)
      .then(setRes)
      .catch((e) => setErr(msg(e)));
  };
  return (
    <Paper variant="outlined" style={{ padding: 16, marginBottom: 16 }}>
      <Typography variant="h6">{title}</Typography>
      {fields.map((f) => (
        <TextField
          key={f}
          label={f}
          size="small"
          value={vals[f] || ""}
          onChange={(e) => setVals({ ...vals, [f]: e.target.value })}
          style={{ margin: "8px 8px 8px 0" }}
        />
      ))}
      <Button variant="contained" onClick={go} style={{ marginTop: 8 }}>
        {submitLabel}
      </Button>
      {err && (
        <Alert severity="error" style={{ marginTop: 8 }}>
          {err}
        </Alert>
      )}
      {res && render(res)}
    </Paper>
  );
};

const RegistriesTab = () => (
  <Box>
    <FormBox
      title="Search facilities (HFR)"
      fields={["name", "state", "district", "facilityId"]}
      action={api.searchFacilities}
      submitLabel="Search"
      render={(r) => <SearchResult res={r} />}
    />
    <FormBox
      title="Search professionals (HPR)"
      fields={["name", "hprId", "mobile"]}
      action={api.searchProfessionals}
      submitLabel="Search"
      render={(r) => <SearchResult res={r} />}
    />
    <FormBox
      title="Submit test facility"
      fields={[
        "facilityName",
        "ownership",
        "state",
        "district",
        "pincode",
        "address",
        "facilityType",
      ]}
      action={api.submitFacility}
      submitLabel="Submit test facility"
      render={(r) =>
        r.error ? (
          <Alert severity="error" style={{ marginTop: 8 }}>
            {r.error}
            {r.abdmCode ? ` (${r.abdmCode})` : ""}
          </Alert>
        ) : (
          <Json value={r} />
        )
      }
    />
  </Box>
);

const TrafficTab = () => {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState({});
  const [err, setErr] = useState(null);
  const load = useCallback(
    () =>
      api
        .getMessages(100)
        .then(setRows)
        .catch((e) => setErr(msg(e))),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  return (
    <Box>
      {err && <Alert severity="error">{err}</Alert>}
      <Button variant="outlined" onClick={load} style={{ marginBottom: 8 }}>
        Refresh
      </Button>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Dir</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Path</TableCell>
            <TableCell>Request ID</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((m) => (
            <React.Fragment key={m.id}>
              <TableRow
                hover
                onClick={() => setOpen({ ...open, [m.id]: !open[m.id] })}
                style={{ cursor: "pointer" }}
              >
                <TableCell>{fmt(m.createdAt)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={m.direction}
                    color={m.direction === "IN" ? "primary" : "secondary"}
                  />
                </TableCell>
                <TableCell>{m.method}</TableCell>
                <TableCell>{m.path}</TableCell>
                <TableCell>{m.requestId}</TableCell>
                <TableCell>{m.httpStatus}</TableCell>
              </TableRow>
              {open[m.id] && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Json value={m.body} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const AbdmDemo = () => {
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState(null);
  const [request, setRequest] = useState(null);
  const view = (r) => {
    setRequest(r);
    setTab(3);
  };
  return (
    <Paper style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>
        ABDM (demo)
      </Typography>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Status" />
        <Tab label="HIP · Link records" />
        <Tab label="HIU · Request records" />
        <Tab label="Records received" />
        <Tab label="Registries (M4)" />
        <Tab label="Traffic" />
      </Tabs>
      <Box style={{ paddingTop: 16 }}>
        {tab === 0 && <StatusTab status={status} setStatus={setStatus} />}
        {tab === 1 && <HipTab />}
        {tab === 2 && <HiuTab status={status} onViewRecords={view} />}
        {tab === 3 && <RecordsTab request={request} />}
        {tab === 4 && <RegistriesTab />}
        {tab === 5 && <TrafficTab />}
      </Box>
    </Paper>
  );
};

export default AbdmDemo;
