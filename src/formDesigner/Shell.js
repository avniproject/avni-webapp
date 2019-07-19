import React from "react";
import { withRouter } from "react-router-dom";

const Shell = props => {
  const { header: Header, history, location, match, content: Content } = props;
  return (
    <div>
      {Header && <Header />}
      <Content history={history} match={match} location={location} />
    </div>
  );
};

export default withRouter(Shell);
