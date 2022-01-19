import React, { Fragment } from "react";
import { isEmpty, map, zip, toUpper } from "lodash";
import { Box, Typography } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";

const RuleSummaryComponent = ({ summary }) => {
  if (isEmpty(summary)) return null;

  const { actionSummary, ruleSummary, conjunctions } = summary;
  return (
    <Box component={"div"} m={1} p={1} border={1}>
      <Typography gutterBottom variant={"subtitle1"}>
        {"Summary"}
      </Typography>
      <ul>
        {map(actionSummary, as => (
          <li>{as}</li>
        ))}
        {map(zip(ruleSummary, conjunctions), ([ruleSummary, conjunction]) => (
          <Fragment>
            <li>{ruleSummary}</li>
            {conjunction && <Chip label={toUpper(conjunction)} />}
          </Fragment>
        ))}
      </ul>
    </Box>
  );
};

export default RuleSummaryComponent;
