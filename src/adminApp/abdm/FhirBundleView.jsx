// DEMO-ONLY abdm-hackathon
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { summariseBundle } from "./fhirRender";

const FhirBundleView = ({ bundle }) => {
  const s = summariseBundle(bundle);
  return (
    <Card variant="outlined" style={{ marginBottom: 16 }}>
      <CardContent>
        <Typography variant="h6">{s.title || "Untitled document"}</Typography>
        <Typography variant="body2" color="textSecondary">
          Date: {s.date || "-"} · Patient: {s.patientName || "-"} · HIP:{" "}
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
        <details style={{ marginTop: 8 }}>
          <summary>Raw FHIR JSON</summary>
          <pre style={{ overflow: "auto", maxHeight: 400 }}>
            {JSON.stringify(bundle, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default FhirBundleView;
