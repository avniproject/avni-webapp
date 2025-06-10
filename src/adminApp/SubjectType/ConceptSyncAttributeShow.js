import React from "react";
import { TableHead, TableRow, TableCell, TableBody, Table } from "@mui/material";

export const ConceptSyncAttributesShow = ({ subjectType, concept1Name, concept2Name }) => {
  const { syncRegistrationConcept1, syncRegistrationConcept2 } = subjectType;
  return (
    (syncRegistrationConcept1 || syncRegistrationConcept2) && (
      <Table aria-label="ConceptSyncAttributesShow">
        <TableHead>
          <TableRow>
            <TableCell align="left">{"Sync concept"}</TableCell>
            <TableCell align="left">{"Usable"}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {syncRegistrationConcept1 && (
            <TableRow>
              <TableCell align="left">{concept1Name}</TableCell>
              <TableCell align="left">{subjectType.syncRegistrationConcept1Usable ? "Yes" : "No"}</TableCell>
            </TableRow>
          )}
          {syncRegistrationConcept2 && (
            <TableRow>
              <TableCell align="left">{concept2Name}</TableCell>
              <TableCell align="left">{subjectType.syncRegistrationConcept2Usable ? "Yes" : "No"}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  );
};
