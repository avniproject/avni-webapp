import React, { Fragment } from "react";
import ProgramView from "./subjectDashboardProgramView";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";

function TabPanel(props) {
  const { children, value, index } = props;

  return <Typography>{value == index && <Box p={3}>{children}</Box>}</Typography>;
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

const programDetails = ({ tabPanelValue, programData }) => {
  return (
    <div>
      {programData && programData.enrolments
        ? programData.enrolments.map((element, index) => (
            <Fragment>
              <TabPanel value={tabPanelValue} index={index}>
                <ProgramView programData={element} />
              </TabPanel>
            </Fragment>
          ))
        : ""}
    </div>
  );
};

export default programDetails;

// {flagToCheckActivePrograms && program && program.enrolments
//     ? program.enrolments.map((element, index) => (
//         <Fragment>
//           <TabPanel value={activeValue} index={index}>
//             <ProgramView programData={element} />
//           </TabPanel>
//         </Fragment>
//       ))
//     : ""}
//   {!flagToCheckActivePrograms && program && program.enrolments
//     ? program.enrolments.map((element, index) => (
//         <Fragment>
//           <TabPanel value={exitedValue} index={index}>
//             <ProgramView programData={element} />
//           </TabPanel>
//         </Fragment>
//       ))
//     : ""}
