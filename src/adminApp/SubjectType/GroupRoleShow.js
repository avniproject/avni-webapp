import { FormLabel, Box, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

import { filter } from "lodash";

export const GroupRoleShow = ({ groupRoles }) => {
  const nonVoidedRoles = filter(groupRoles, ({ voided }) => !voided);
  return (
    <Box
      sx={{
        mb: 2
      }}
    >
      <FormLabel style={{ fontSize: "13px" }}>Group Roles</FormLabel>
      <Box
        sx={{
          border: 1,
          borderBottom: 0,
          borderColor: "grey.300"
        }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Role</TableCell>
              <TableCell align="right">Member Subject</TableCell>
              <TableCell align="right">Maximum number of members</TableCell>
              <TableCell align="right">Minimum number of members</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nonVoidedRoles.map(({ role, subjectMemberName, maximumNumberOfMembers, minimumNumberOfMembers }, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {role}
                </TableCell>
                <TableCell align="right">{subjectMemberName}</TableCell>
                <TableCell align="right">{maximumNumberOfMembers}</TableCell>
                <TableCell align="right">{minimumNumberOfMembers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};
