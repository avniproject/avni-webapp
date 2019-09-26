import React, { useEffect } from "react";
import { isEmpty, noop } from "lodash";

export const TranslationDashboard = props => {

  const renderTableHeader = () => {
    let header = Object.keys(props.data[0]);
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  const renderTable = () => {
    return props.data.map((row, index) => (
      <tr key={index}>
        <td>{row["Language"]}</td>
        <td>{row["Total Keys"]}</td>
        <td>{row["Keys with translations"]}</td>
        <td>{row["Keys with Empty Translations"]}</td>
        <td>{row["Keys to be done"]}</td>
      </tr>
    ));
  };

  return !isEmpty(props.data) && (
    <div style={{ marginBottom: 30 }}>
      <h1 id="title">Translations Dashboard</h1>
      <table id="translation">
        <tbody>
          <tr>{renderTableHeader()}</tr>
          {renderTable()}
        </tbody>
      </table>
    </div>
  );
};
