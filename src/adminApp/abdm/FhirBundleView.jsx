import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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

const displaySize = (bytes) =>
  bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} bytes`;

const openAttachment = (a) => {
  const bytes = Uint8Array.from(window.atob(a.data), (ch) => ch.charCodeAt(0));
  const url = URL.createObjectURL(
    new Blob([bytes], { type: "application/pdf" }),
  );
  window.open(url, "_blank", "noopener");
  window.setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
};

// One entry and, indented under it, its parts: a lab report's results, an invoice's lines.
const ItemRows = ({ item, depth = 0 }) => (
  <>
    <TableRow>
      <TableCell style={{ paddingLeft: 16 + depth * 24, width: "40%" }}>
        {item.label}
      </TableCell>
      <TableCell style={{ width: "20%", color: "#666" }}>{item.kind}</TableCell>
      <TableCell>{item.value}</TableCell>
    </TableRow>
    {(item.children || []).map((c, i) => (
      <ItemRows key={i} item={c} depth={depth + 1} />
    ))}
  </>
);

const FhirBundleView = ({ bundle }) => {
  const s = summariseBundle(bundle);
  return (
    <Card variant="outlined" style={{ marginBottom: 16 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">{s.title || "Untitled document"}</Typography>
          {s.recordType && (
            <Chip size="small" color="primary" label={s.recordType} />
          )}
        </Box>
        <Typography variant="body2" color="textSecondary">
          Date: {displayDate(s.date)} · Patient: {s.patientName || "-"} · HIP:{" "}
          {s.hipName || "-"}
        </Typography>
        {s.sections.length > 0 ? (
          s.sections.map((section, i) => (
            <Box key={i} style={{ marginTop: 12 }}>
              <Typography variant="subtitle2">{section.title}</Typography>
              <Table size="small">
                <TableBody>
                  {section.items.map((item, j) => (
                    <ItemRows key={j} item={item} />
                  ))}
                </TableBody>
              </Table>
            </Box>
          ))
        ) : (
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
        )}
        {s.attachments.map((a, i) => (
          <Button
            key={i}
            size="small"
            variant="outlined"
            style={{ marginTop: 8, marginRight: 8 }}
            onClick={() => openAttachment(a)}
          >
            PDF copy{a.title ? `: ${a.title}` : ""} ({displaySize(a.size)})
          </Button>
        ))}
        {s.images.map((a, i) => (
          <Box key={i} style={{ marginTop: 8 }}>
            <Typography variant="caption" display="block">
              Image{a.title ? `: ${a.title}` : ""} ({displaySize(a.size)})
            </Typography>
            <img
              src={`data:${a.contentType};base64,${a.data}`}
              alt={a.title || "Image in the record"}
              style={{ maxWidth: 480, border: "1px solid #ddd" }}
            />
          </Box>
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
