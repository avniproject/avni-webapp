import React, { useEffect, useState } from "react";
import { isEmpty, find } from "lodash";
import { localeChoices } from "../common/constants";

export const TranslationDashboard = props => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const keyCounts = [];
    props.data &&
      props.data.forEach(({ language, translationJson }) => {
        const total = Object.keys(translationJson).length;
        const incomplete = Object.values(translationJson).filter(
          t => isEmpty(t) || t === props.emptyTranslationKey
        ).length;
        const complete = total - incomplete;
        keyCounts.push({
          Language: find(localeChoices, locale => locale.id === language).name,
          "Total keys": total,
          "Keys with translations": complete,
          "Keys without translations": incomplete
        });
      });
    setData(keyCounts);
  }, [props.data]);

  const renderTableHeader = () => {
    let header = Object.keys(data[0]);
    return header.map((key, index) => {
      return <th key={index}>{key}</th>;
    });
  };

  const renderTable = () => {
    return data.map((row, index) => (
      <tr key={index}>
        <td>{row["Language"]}</td>
        <td>{row["Total keys"]}</td>
        <td>{row["Keys with translations"]}</td>
        <td>{row["Keys without translations"]}</td>
      </tr>
    ));
  };

  return (
    !isEmpty(data) && (
      <div style={{ marginBottom: 30 }}>
        <h5 id="title">Translations Dashboard</h5>
        <table id="translation">
          <tbody>
            <tr>{renderTableHeader()}</tr>
            {renderTable()}
          </tbody>
        </table>
      </div>
    )
  );
};
