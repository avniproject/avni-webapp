import React from "react";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";

export const ConceptSyncAttributesShow = ({ header1, header1Value, isUsable }) => {
  return (
    <Table aria-label="ConceptSyncAttributesShow">
      <TableHead>
        <TableRow>
          <TableCell align="left">{header1}</TableCell>
          <TableCell align="left">{"Usable"}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell align="left">{header1Value}</TableCell>
          <TableCell align="left">{isUsable ? "Yes" : "No"}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
