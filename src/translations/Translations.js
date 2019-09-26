import React, { useEffect, useState } from "react";
import axios from "axios";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { find, identity, isEmpty, isNil, sortBy } from "lodash";
import DropDown from "../common/components/DropDown";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Grid from "@material-ui/core/Grid";
import { getOrgConfig } from "./reducers/onLoadReducer";
import { connect } from "react-redux";
import { getLocales } from "../common/utils";
import Loading from "../dataEntryApp/components/Loading";
import Import from "./Import";

export const Translations = ({ user, organisation, organisationConfig, getOrgConfig }) => {
  useEffect(() => {
    getOrgConfig();
  }, []);

  const initialTableState = {
    "Complete Keys": 0,
    "Incomplete Keys": 0
  };

  const platforms = [{ id: "Android", name: "Android" }, { id: "Web", name: "Web" }];
  const localeChoices = organisationConfig && getLocales(organisationConfig);

  const [tableData, setTableData] = useState(initialTableState);
  const [platform, setPlatform] = useState("");

  const onDownloadPressedHandler = () => {
    if (isEmpty(platform)) {
      return alert("Please choose platform to download translation file");
    }
    const platformId = find(platforms, p => p.name === platform).id;
    return axios({
      url: "/translation",
      method: "GET",
      params: { platform: platformId }
    })
      .then(response => {
        const zip = new JSZip();
        const folder = zip.folder("locale");
        response.data.forEach(data =>
          folder.file(data.language + ".json", JSON.stringify(data.translationJson))
        );
        zip.generateAsync({ type: "blob" }).then(content => saveAs(content, "translations.zip"));
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data.message);
        } else {
          alert("Something went wrong while downloading this file");
        }
      });
  };

  const renderTable = () => (
    <tr>
      <td>{tableData["Complete Keys"]}</td>
      <td>{tableData["Incomplete Keys"]}</td>
    </tr>
  );

  const renderTableHeader = () => {
    let header = Object.keys(tableData);
    return header.map((key, index) => {
      return <th key={index}>{key}</th>;
    });
  };

  if (isNil(organisationConfig)) return <Loading />;

  return (
    <ScreenWithAppBar appbarTitle={`Translations`}>
      <div id={"margin"}>
        <div style={{ marginBottom: 30 }}>
          <h1 id="title">Translations Dashboard</h1>
          <table id="translation">
            <tbody>
              <tr>{renderTableHeader()}</tr>
              {renderTable()}
            </tbody>
          </table>
        </div>
        <Grid container direction="row" justify="flex-start" alignItems="center">
          <Import locales={localeChoices} />
        </Grid>
        <p />
        <Grid container direction="row" justify="flex-start" alignItems="center" m={3}>
          <DropDown name="Platform" value={platform} onChange={setPlatform} options={platforms} />
          <div style={{ padding: 15 }} className="box has-text-centered">
            <button className="button" onClick={onDownloadPressedHandler}>
              Download
            </button>
          </div>
        </Grid>
      </div>
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  organisationConfig: state.translations.onLoad.organisationConfig
});

export default connect(
  mapStateToProps,
  { getOrgConfig }
)(Translations);
