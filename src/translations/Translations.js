import { useEffect, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { find, isEmpty } from "lodash";
import DropDown from "../common/components/DropDown";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Grid, Button, Box, Checkbox, FormControlLabel } from "@mui/material";
import { getDashboardData, getOrgConfig } from "./reducers/onLoadReducer";
import { useSelector, useDispatch } from "react-redux";
import { getLocales } from "../common/utils";
import Import from "./Import";
import { TranslationDashboard } from "./TranslationDashboard";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { useNavigate } from "react-router-dom";

const EMPTY_TRANSLATION_KEY = "KEY_NOT_DEFINED";
const Translations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const organisationConfig = useSelector(state => state.translations.onLoad.organisationConfig);
  const dashboardData = useSelector(state => state.translations.onLoad.dashboardData);
  const localeChoices = organisationConfig && getLocales(organisationConfig);
  const [platform, setPlatform] = useState("");
  const [excludeLocations, setExcludeLocations] = useState(false);

  useEffect(() => {
    dispatch(getOrgConfig());
    dispatch(getDashboardData("Android", EMPTY_TRANSLATION_KEY));
  }, [dispatch]);

  const onDownloadPressedHandler = () => {
    const platformId = find(platforms, p => p.name === platform).id;
    return http
      .get(http.withParams("/translation", { platform: platformId, includeLocations: !excludeLocations }))
      .then(response => {
        const zip = new JSZip();
        const folder = zip.folder("locale");
        response.data.forEach(data => folder.file(data.language + ".json", JSON.stringify(data.translationJson, undefined, 2)));
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

  const platforms = [{ id: "Android", name: "Android" }, { id: "Web", name: "Web" }];

  if (isEmpty(localeChoices)) {
    const link = (
      <span
        style={{ cursor: "pointer", color: "blue", textDecorationLine: "underline" }}
        onClick={() => navigate("/admin/organisationConfig")}
      >
        click here
      </span>
    );
    return (
      <ScreenWithAppBar appbarTitle={`Translations`} enableLeftMenuButton={true} renderAllOptions={false}>
        <Box>Language not set {link} to set.</Box>
      </ScreenWithAppBar>
    );
  }

  return (
    <ScreenWithAppBar appbarTitle={`Translations`}>
      <DocumentationContainer filename={"Translation.md"}>
        <div id={"margin"}>
          <Box
            sx={{
              border: 1,
              borderColor: "#ddd",
              p: 2
            }}
          >
            <TranslationDashboard data={dashboardData} emptyTranslationKey={EMPTY_TRANSLATION_KEY} />
          </Box>
          <p />
          <Box
            sx={{
              border: 1,
              borderColor: "#ddd",
              p: 2
            }}
          >
            <Grid>
              <h5 id="title">Upload Translations</h5>
            </Grid>
            <Grid
              container
              direction="row"
              sx={{
                justifyContent: "flex-start",
                alignItems: "center"
              }}
            >
              <Import locales={localeChoices} onSuccessfulImport={() => getDashboardData("Android", EMPTY_TRANSLATION_KEY)} />
            </Grid>
          </Box>
          <p />
          <Box
            sx={{
              border: 1,
              borderColor: "#ddd",
              p: 2
            }}
          >
            <Grid>
              <h5 id="title">Download Translations</h5>
            </Grid>
            <Grid
              container
              spacing={2}
              sx={{
                justifyContent: "flex-start",
                alignItems: "center",
                flexWrap: "nowrap",
                m: 3
              }}
            >
              <Grid>
                <DropDown name="Platform" value={platform} onChange={setPlatform} options={platforms} />
              </Grid>
              <Grid>
                <Box>
                  <FormControlLabel
                    control={<Checkbox checked={excludeLocations} onChange={() => setExcludeLocations(prev => !prev)} color="primary" />}
                    label="Exclude Locations"
                  />
                </Box>
              </Grid>
              <Grid>
                <Box>
                  <Button
                    variant="contained"
                    onClick={onDownloadPressedHandler}
                    color="primary"
                    aria-haspopup="false"
                    disabled={isEmpty(platform)}
                  >
                    Download
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </div>
      </DocumentationContainer>
    </ScreenWithAppBar>
  );
};

export default Translations;
