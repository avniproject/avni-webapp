import React from "react";
import _ from "lodash";
import FormCard from "./FormCard";

function renderRow(cols, rowKey) {
  return (
    <div className="row" key={rowKey}>
      {cols}
    </div>
  );
}

export default function ProgramForms(props) {
  const rows = [];
  let cols = [];
  let uuid;
  let i = 0;
  _.forEach(props.forms, form => {
    uuid = form.uuid;
    i++;
    cols.push(<FormCard form={form} key={uuid + i} history={props.history} />);
    if (cols.length === 4) {
      rows.push(renderRow(cols, uuid + "-" + rows.length));
      cols = [];
    }
  });
  rows.push(renderRow(cols, uuid + "-" + rows.length));
  return <div>{rows}</div>;
}
