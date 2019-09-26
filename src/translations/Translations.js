import React, {useEffect, useState} from "react";
import axios from "axios";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import {find, isEmpty, isNil} from "lodash";
import DropDown from "../common/components/DropDown";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import Grid from "@material-ui/core/Grid";
import {getDashboardData, getOrgConfig} from "./reducers/onLoadReducer";
import {connect} from "react-redux";
import {getLocales} from "../common/utils";
import Loading from "../dataEntryApp/components/Loading";
import Import from "./Import";
import {TranslationDashboard} from "./TranslationDashboard";

const EMPTY_TRANSLATION_KEY = 'KEY_NOT_DEFINED';
export const Translations = ({user, organisation, organisationConfig, getOrgConfig, dashboardData, getDashboardData}) => {
  useEffect(() => {
    getOrgConfig();
    getDashboardData("Android", EMPTY_TRANSLATION_KEY)
  }, []);

  const platforms = [{id: "Android", name: "Android"}, {id: "Web", name: "Web"}];
  const localeChoices = organisationConfig && getLocales(organisationConfig);
  const [platform, setPlatform] = useState("");

  const onDownloadPressedHandler = () => {
    if (isEmpty(platform)) {
      return alert("Please choose platform to download translation file");
    }
    const platformId = find(platforms, p => p.name === platform).id;
    return axios({
      url: "/translation",
      method: "GET",
      params: {platform: platformId}
    })
      .then(response => {
        const zip = new JSZip();
        const folder = zip.folder("locale");
        response.data.forEach(data =>
          folder.file(data.language + ".json", JSON.stringify(data.translationJson))
        );
        zip.generateAsync({type: "blob"}).then(content => saveAs(content, "translations.zip"));
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data.message);
        } else {
          alert("Something went wrong while downloading this file");
        }
      });
  };

  if (isNil(organisationConfig)) return <Loading/>;

  return (
    <ScreenWithAppBar appbarTitle={`Translations`}>
      <div id={"margin"}>
        <TranslationDashboard data={dashboardData}/>
        <Grid container direction="row" justify="flex-start" alignItems="center">
          <Import locales={localeChoices} onSuccessfulImport={() => getDashboardData("Android", EMPTY_TRANSLATION_KEY)}/>
        </Grid>
        <p/>
        <Grid container direction="row" justify="flex-start" alignItems="center" m={3}>
          <DropDown name="Platform" value={platform} onChange={setPlatform} options={platforms}/>
          <div style={{padding: 15}} className="box has-text-centered">
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
  organisationConfig: state.translations.onLoad.organisationConfig,
  dashboardData: state.translations.onLoad.dashboardData
});

export default connect(
  mapStateToProps,
  {getOrgConfig, getDashboardData}
)(Translations);
