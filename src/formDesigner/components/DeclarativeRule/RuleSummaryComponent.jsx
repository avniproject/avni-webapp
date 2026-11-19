import { Fragment } from "react";
import { isEmpty, map, zip, toUpper } from "lodash";
import { Typography, Chip } from "@mui/material";

const RuleSummaryComponent = ({ summary, ruleNumber, displayRuleCounts }) => {
  if (isEmpty(summary)) return null;

  const { actionSummary, ruleSummary, conjunctions } = summary;
  const wrapStyles = {
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    whiteSpace: "normal",
    maxWidth: "100%",
  };
  return (
    <Fragment>
      {displayRuleCounts && (
        <Typography sx={{ mb: 1, ...wrapStyles }} variant={"subtitle2"}>
          {`Rule ${ruleNumber}`}
        </Typography>
      )}
      <ul style={{ paddingLeft: 16, margin: 0 }}>
        {map(actionSummary, (as, idx) => (
          <li key={`action-${idx}`} style={wrapStyles}>
            <Typography component="span" sx={wrapStyles}>
              {as}
            </Typography>
          </li>
        ))}
        {map(
          zip(ruleSummary, conjunctions),
          ([ruleSummary, conjunction], idx) => (
            <li key={`rule-${idx}`} style={wrapStyles}>
              <Typography component="span" sx={wrapStyles}>
                {ruleSummary}
              </Typography>
              {conjunction && (
                <Chip
                  label={toUpper(conjunction)}
                  sx={{ ml: 1, verticalAlign: "middle" }}
                />
              )}
            </li>
          ),
        )}
      </ul>
    </Fragment>
  );
};

export default RuleSummaryComponent;
