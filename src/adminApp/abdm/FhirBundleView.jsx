// DEMO-ONLY abdm-hackathon
import {
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { summariseBundle, withoutAttachmentData } from "./fhirRender";

// FHIR dates are ISO UTC; shown in Indian time, as the health worker saw the visit.
const displayDate = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || isNaN(d.getTime())) return value || "-";
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const openAttachment = (a) => {
  const bytes = Uint8Array.from(window.atob(a.data), (ch) => ch.charCodeAt(0));
  const url = URL.createObjectURL(
    new Blob([bytes], { type: "application/pdf" }),
  );
  window.open(url, "_blank", "noopener");
  window.setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
};

const FhirBundleView = ({ bundle }) => {
  const s = summariseBundle(bundle);
  return (
    <Card variant="outlined" style={{ marginBottom: 16 }}>
      <CardContent>
        <Typography variant="h6">{s.title || "Untitled document"}</Typography>
        <Typography variant="body2" color="textSecondary">
          Date: {displayDate(s.date)} · Patient: {s.patientName || "-"} · HIP:{" "}
          {s.hipName || "-"}
        </Typography>
        <Table size="small" style={{ marginTop: 8 }}>
          <TableBody>
            {s.rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.label}</TableCell>
                <TableCell>{r.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {s.attachments.map((a, i) => (
          <Button
            key={i}
            size="small"
            variant="outlined"
            style={{ marginTop: 8, marginRight: 8 }}
            onClick={() => openAttachment(a)}
          >
            PDF copy{a.title ? `: ${a.title}` : ""}
          </Button>
        ))}
        <details style={{ marginTop: 8 }}>
          <summary>Raw FHIR JSON</summary>
          <pre style={{ overflow: "auto", maxHeight: 400 }}>
            {JSON.stringify(withoutAttachmentData(bundle), null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default FhirBundleView;
