import React, { Fragment } from "react";
import ProgramView from "./subjectDashboardProgramView";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";

function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <Typography component={"span"}>{value === index && <Box p={3}>{children}</Box>}</Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

const programDetails = ({
  tabPanelValue,
  programData,
  handleUpdateComponent,
  enableReadOnly,
  subjectTypeUuid
}) => {
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
                  enableReadOnly={enableReadOnly}
                  subjectTypeUuid={subjectTypeUuid}
                />
              </TabPanel>
            </Fragment>
          ))
        : ""}
    </div>
  );
};

export default programDetails;
