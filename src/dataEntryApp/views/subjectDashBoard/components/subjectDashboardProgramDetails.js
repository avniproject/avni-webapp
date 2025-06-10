import React, { Fragment } from "react";
import ProgramView from "./subjectDashboardProgramView";
import { Typography, Box } from "@mui/material";
import PropTypes from "prop-types";

function TabPanel(props) {
  const { children, value, index } = props;

  return <Typography component={"span"}>{value === index && <Box p={3}>{children}</Box>}</Typography>;
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

const programDetails = ({ tabPanelValue, programData, handleUpdateComponent, subjectTypeUuid, subjectVoided }) => {
  return (
    <div>
      {programData && programData.enrolments
        ? programData.enrolments.map((element, index) => (
            <Fragment key={index}>
              <TabPanel value={tabPanelValue} index={index}>
                <ProgramView
                  subjectUuid={programData.uuid}
                  programData={element}
                  key={index}
                  handleUpdateComponent={handleUpdateComponent}
                  subjectTypeUuid={subjectTypeUuid}
                  subjectVoided={subjectVoided}
                />
              </TabPanel>
            </Fragment>
          ))
        : ""}
    </div>
  );
};

export default programDetails;
