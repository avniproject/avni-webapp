import React, { Fragment } from "react";
import { isEmpty, map, zip, toUpper } from "lodash";
import { Typography } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";

const RuleSummaryComponent = ({ summary, ruleNumber, displayRuleCounts }) => {
  if (isEmpty(summary)) return null;

  const { actionSummary, ruleSummary, conjunctions } = summary;
  return (
    <Fragment>
      {displayRuleCounts && (
        <Typography gutterBottom variant={"subtitle2"}>
          {`Rule ${ruleNumber}`}
        </Typography>
      )}
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
    </Fragment>
  );
};

export default RuleSummaryComponent;
