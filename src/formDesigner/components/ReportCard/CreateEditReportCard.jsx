import { useState, useReducer, useEffect, useRef, Fragment } from "react";
import { ReportCardReducer, ReportCardReducerKeys } from "./ReportCardReducer";
import { httpClient as http } from "../../../common/utils/httpClient";
import { get, isNil, sortBy } from "lodash";
import Box from "@mui/material/Box";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import {
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { Title } from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";
import { Navigate, useParams } from "react-router-dom";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { sampleCardQuery } from "../../common/SampleRule";
import { AvniSelect } from "../../../common/components/AvniSelect";
import { MediaFolder, uploadImage } from "../../../common/utils/S3Client";
import {
  createServerError,
  getErrorByKey,
  getServerError,
  hasServerError,
  removeServerError,
} from "../../common/ErrorUtil";
import { JSEditor } from "../../../common/components/JSEditor";
import { PopoverColorPicker } from "../../../common/components/PopoverColorPicker";
import WebReportCard from "../../../common/model/WebReportCard";
import DashboardService from "../../../common/service/DashboardService";
import CustomCardConfigService from "../../../common/service/CustomCardConfigService";
import FormMetaDataSelect from "../../../common/components/FormMetaDataSelect";
import { ReportCard, StandardReportCardType } from "openchs-models";
import { ValueTextUnitSelect } from "../../../common/components/ValueTextUnitSelect";
import CustomizedSnackbar from "../CustomizedSnackbar";
import { AvniMediaUpload } from "../../../common/components/AvniMediaUpload";

export const CreateEditReportCard = () => {
  const params = useParams();
  const edit = !isNil(params.id);
  const [card, dispatch] = useReducer(
    ReportCardReducer,
    WebReportCard.createNewReportCard(),
  );
  const [error, setError] = useState([]);
  const [id, setId] = useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = useState(false);
  const [cardType, setCardType] = useState(ReportCard.cardTypes.standard);
  const [standardReportCardTypes, setStandardReportCardTypes] = useState([]);
  const [file, setFile] = useState();
  const [htmlFile, setHtmlFile] = useState();
  const customCardConfigUuidRef = useRef(null);
  const [customCardDataRule, setCustomCardDataRule] = useState("");
  const [customCardHtmlFileS3Key, setCustomCardHtmlFileS3Key] = useState("");
  const [actionSubjectTypes, setActionSubjectTypes] = useState([]);
  const [actionPrograms, setActionPrograms] = useState([]);
  const [actionEncounterTypes, setActionEncounterTypes] = useState([]);

  useEffect(() => {
    DashboardService.getStandardReportCardTypes().then(
      setStandardReportCardTypes,
    );
    if (edit) {
      DashboardService.getReportCard(params.id).then((res) => {
        dispatch({ type: ReportCardReducerKeys.setData, payload: res });
        setCardType(ReportCard.deriveCardType(res));
        if (res.customCardConfig?.uuid) {
          customCardConfigUuidRef.current = res.customCardConfig.uuid;
          CustomCardConfigService.getByUuid(res.customCardConfig.uuid).then(
            (config) => {
              setCustomCardDataRule(config.dataRule || "");
              setCustomCardHtmlFileS3Key(config.htmlFileS3Key || "");
            },
          );
        }
      });
    } else {
      dispatch({ type: ReportCardReducerKeys.color, payload: "#ff0000" });
    }
  }, []);

  const onCardTypeChange = (nextType) => {
    setCardType(nextType);
    const { standard, nested, customData, fullyCustom } = ReportCard.cardTypes;
    if (nextType === standard) {
      dispatch({ type: ReportCardReducerKeys.query, payload: null });
      dispatch({
        type: ReportCardReducerKeys.nested,
        payload: {
          nested: false,
          count: WebReportCard.MinimumNumberOfNestedCards,
        },
      });
      dispatch({ type: ReportCardReducerKeys.action, payload: null });
      dispatch({ type: ReportCardReducerKeys.customCardConfig, payload: null });
    } else if (nextType === nested) {
      dispatch({
        type: ReportCardReducerKeys.standardReportCardType,
        payload: null,
      });
      dispatch({
        type: ReportCardReducerKeys.nested,
        payload: {
          nested: true,
          count: WebReportCard.MinimumNumberOfNestedCards,
        },
      });
      dispatch({
        type: ReportCardReducerKeys.action,
        payload: ReportCard.actionTypes.ViewSubjectProfile,
      });
      dispatch({ type: ReportCardReducerKeys.customCardConfig, payload: null });
    } else if (nextType === customData) {
      dispatch({
        type: ReportCardReducerKeys.standardReportCardType,
        payload: null,
      });
      dispatch({
        type: ReportCardReducerKeys.nested,
        payload: {
          nested: false,
          count: WebReportCard.MinimumNumberOfNestedCards,
        },
      });
      dispatch({
        type: ReportCardReducerKeys.action,
        payload: ReportCard.actionTypes.ViewSubjectProfile,
      });
      dispatch({ type: ReportCardReducerKeys.customCardConfig, payload: null });
    } else if (nextType === fullyCustom) {
      dispatch({
        type: ReportCardReducerKeys.standardReportCardType,
        payload: null,
      });
      dispatch({ type: ReportCardReducerKeys.query, payload: null });
      dispatch({
        type: ReportCardReducerKeys.nested,
        payload: {
          nested: false,
          count: WebReportCard.MinimumNumberOfNestedCards,
        },
      });
      dispatch({ type: ReportCardReducerKeys.action, payload: null });
    }
  };

  useEffect(() => {
    if (card.action === ReportCard.actionTypes.DoVisit) {
      http
        .getAllData("subjectType", "/web/subjectType")
        .then((response) => setActionSubjectTypes(response));
    }
  }, [card.action]);

  useEffect(() => {
    if (
      card.action === ReportCard.actionTypes.DoVisit &&
      card.actionDetailSubjectTypeUUID
    ) {
      http
        .getData(
          `/web/program/v2?subjectType=${card.actionDetailSubjectTypeUUID}`,
        )
        .then((response) => setActionPrograms(response));
    } else {
      setActionPrograms([]);
    }
  }, [card.action, card.actionDetailSubjectTypeUUID]);

  useEffect(() => {
    if (
      card.action === ReportCard.actionTypes.DoVisit &&
      card.actionDetailSubjectTypeUUID
    ) {
      const programParam = card.actionDetailProgramUUID
        ? `&program=${card.actionDetailProgramUUID}`
        : "";
      http
        .getData(
          `/web/encounterType/v2?subjectType=${card.actionDetailSubjectTypeUUID}${programParam}`,
        )
        .then((response) => setActionEncounterTypes(response));
    } else {
      setActionEncounterTypes([]);
    }
  }, [
    card.action,
    card.actionDetailSubjectTypeUUID,
    card.actionDetailProgramUUID,
  ]);

  useEffect(() => {
    //to handle existing recent type cards without duration configured
    if (
      card.isRecentType() &&
      isNil(card.standardReportCardInputRecentDuration)
    ) {
      dispatch({
        type: ReportCardReducerKeys.duration,
        payload: { value: "1", unit: "days" },
      });
    }
  }, [card]);

  const isStandard = cardType === ReportCard.cardTypes.standard;
  const isNested = cardType === ReportCard.cardTypes.nested;
  const isCustomData = cardType === ReportCard.cardTypes.customData;
  const isFullyCustom = cardType === ReportCard.cardTypes.fullyCustom;
  const showQueryEditor = isNested || isCustomData;
  const showActionFields = isNested || isCustomData;

  const validateRequest = () => {
    const errors = card.validateCard(cardType);
    if (isFullyCustom && !htmlFile && !customCardHtmlFileS3Key) {
      errors.push({
        key: "MISSING_HTML_FILE",
        message: "HTML file is required",
      });
    }
    setError(errors);
    return errors.length === 0;
  };

  const onSave = async () => {
    if (!validateRequest()) return;
    try {
      const [s3FileKey, iconError] = await uploadImage(
        card.iconFileS3Key,
        file,
        MediaFolder.ICONS,
      );
      if (iconError) {
        alert(iconError);
        return;
      }
      card.iconFileS3Key = s3FileKey;

      if (isFullyCustom) {
        let htmlFileS3Key = customCardHtmlFileS3Key;
        if (htmlFile) {
          if (!customCardConfigUuidRef.current) {
            const configRes = await CustomCardConfigService.save({
              name: card.name,
              dataRule: customCardDataRule || null,
            });
            customCardConfigUuidRef.current = configRes.data.uuid;
          }
          const uploadRes = await CustomCardConfigService.uploadHtml(
            customCardConfigUuidRef.current,
            htmlFile,
          );
          htmlFileS3Key = uploadRes?.data || htmlFileS3Key;
          setCustomCardHtmlFileS3Key(htmlFileS3Key);
        }
        card.customCardConfig = {
          uuid: customCardConfigUuidRef.current,
          name: card.name,
          dataRule: customCardDataRule || null,
          htmlFileS3Key: htmlFileS3Key || null,
        };
      }

      const res = await DashboardService.saveReportCard(card);
      if (res.status === 200) {
        if (isFullyCustom && res.data?.customCardConfigUUID) {
          customCardConfigUuidRef.current = res.data.customCardConfigUUID;
        }
        setId(res.data.id);
      }
    } catch (e) {
      setError([createServerError(e, "error while saving card")]);
    }
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete card record?")) {
      http.delete(`/web/reportCard/${params.id}`).then((response) => {
        if (response.status === 200) {
          setRedirectAfterDelete(true);
        }
      });
    }
  };

  const onChange = (type, event, errorKey) => {
    setError(error.filter(({ key }) => key !== errorKey));
    dispatch({ type: type, payload: event.target.value });
  };

  const standardReportCardTypeName =
    get(card, "standardReportCardType.name") || "";

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
      }}
    >
      <Title title={"Create offline Card"} />
      <DocumentationContainer filename={"Card.md"}>
        {edit && (
          <Grid container style={{ justifyContent: "flex-end" }}>
            <Button
              color="primary"
              type="button"
              onClick={() => setId(params.id)}
            >
              <VisibilityIcon /> Show
            </Button>
          </Grid>
        )}
        <AvniTextField
          multiline
          id="name"
          label="Name*"
          autoComplete="off"
          value={card.name}
          onChange={(event) =>
            onChange(ReportCardReducerKeys.name, event, "EMPTY_NAME")
          }
          toolTipKey={"APP_DESIGNER_CARD_NAME"}
        />
        {getErrorByKey(error, "EMPTY_NAME")}
        <p />
        <AvniTextField
          multiline
          id="description"
          label="Description"
          autoComplete="off"
          value={card.description}
          onChange={(event) =>
            dispatch({
              type: ReportCardReducerKeys.description,
              payload: event.target.value,
            })
          }
          toolTipKey={"APP_DESIGNER_CARD_DESCRIPTION"}
        />
        <p />
        <AvniFormLabel
          label={"Colour Picker"}
          toolTipKey={"APP_DESIGNER_CARD_COLOR"}
        />
        <PopoverColorPicker
          id="colour"
          label="Colour"
          color={card.colour}
          onChange={(color) =>
            dispatch({ type: ReportCardReducerKeys.color, payload: color })
          }
        />
        {getErrorByKey(error, "EMPTY_COLOR")}
        <p />
        <AvniMediaUpload
          onSelect={setFile}
          label={"Icon"}
          accept="image/*"
          toolTipKey={"APP_DESIGNER_CARD_ICON"}
          width={75}
          height={75}
          oldImgUrl={card.iconFileS3Key}
          uniqueName={"concept"}
        />
        <p />
        <FormLabel>Card Type</FormLabel>
        <RadioGroup
          row
          value={cardType}
          onChange={(event) => onCardTypeChange(event.target.value)}
        >
          <FormControlLabel
            value={ReportCard.cardTypes.standard}
            control={<Radio />}
            label="Standard Report Card"
          />
          <FormControlLabel
            value={ReportCard.cardTypes.nested}
            control={<Radio />}
            label="Nested Report Card"
          />
          <FormControlLabel
            value={ReportCard.cardTypes.customData}
            control={<Radio />}
            label="Custom Data Card"
          />
          <FormControlLabel
            value={ReportCard.cardTypes.fullyCustom}
            control={<Radio />}
            label="Custom Design Card"
          />
        </RadioGroup>
        <p />
        {isNested && (
          <AvniSelect
            label="Count of Nested Cards"
            value={card.count}
            style={{ width: "15.625rem" }}
            required
            onChange={(event) =>
              dispatch({
                type: ReportCardReducerKeys.nested,
                payload: { nested: true, count: event.target.value },
              })
            }
            options={Array.from(
              { length: WebReportCard.MaximumNumberOfNestedCards },
              (_, i) => i + 1,
            ).map((num) => ({
              value: num,
              label: num.toString(),
            }))}
            toolTipKey={"APP_DESIGNER_CARD_COUNT"}
          />
        )}
        <p />
        {showActionFields && (
          <AvniSelect
            label="Action"
            value={card.action}
            style={{ width: "15.625rem" }}
            onChange={(event) =>
              dispatch({
                type: ReportCardReducerKeys.action,
                payload: event.target.value,
              })
            }
            options={[
              {
                value: ReportCard.actionTypes.ViewSubjectProfile,
                label: "View subject profile",
              },
              { value: ReportCard.actionTypes.DoVisit, label: "Do visit" },
            ]}
            toolTipKey={"APP_DESIGNER_CARD_ACTION"}
          />
        )}
        {showActionFields && card.action === ReportCard.actionTypes.DoVisit && (
          <>
            <p />
            <AvniSelect
              label="Subject Type*"
              value={card.actionDetailSubjectTypeUUID}
              style={{ width: "15.625rem" }}
              required
              onChange={(event) =>
                dispatch({
                  type: ReportCardReducerKeys.actionDetailSubjectTypeUUID,
                  payload: event.target.value,
                })
              }
              options={actionSubjectTypes.map((st) => ({
                value: st.uuid,
                label: st.name,
              }))}
              toolTipKey={"APP_DESIGNER_CARD_ACTION_SUBJECT_TYPE"}
            />
            <p />
            <AvniSelect
              label="Program"
              value={card.actionDetailProgramUUID}
              style={{ width: "15.625rem" }}
              isClearable
              onChange={(event) =>
                dispatch({
                  type: ReportCardReducerKeys.actionDetailProgramUUID,
                  payload: event.target.value,
                })
              }
              options={actionPrograms.map((p) => ({
                value: p.uuid,
                label: p.name,
              }))}
              toolTipKey={"APP_DESIGNER_CARD_ACTION_PROGRAM"}
            />
            <p />
            <AvniSelect
              label="Encounter Type*"
              value={card.actionDetailEncounterTypeUUID}
              style={{ width: "15.625rem" }}
              required
              onChange={(event) =>
                dispatch({
                  type: ReportCardReducerKeys.actionDetailEncounterTypeUUID,
                  payload: event.target.value,
                })
              }
              options={actionEncounterTypes.map((et) => ({
                value: et.uuid,
                label: et.name,
              }))}
              toolTipKey={"APP_DESIGNER_CARD_ACTION_ENCOUNTER_TYPE"}
            />
            {getErrorByKey(error, "MISSING_ENCOUNTER_TYPE")}
            <p />
            <AvniSelect
              label="Visit Type*"
              value={card.actionDetailVisitType}
              style={{ width: "15.625rem" }}
              required
              onChange={(event) =>
                dispatch({
                  type: ReportCardReducerKeys.actionDetailVisitType,
                  payload: event.target.value,
                })
              }
              options={[
                {
                  value: ReportCard.visitTypes.Scheduled,
                  label: "Scheduled",
                },
                {
                  value: ReportCard.visitTypes.Unplanned,
                  label: "Unplanned",
                },
              ]}
              toolTipKey={"APP_DESIGNER_CARD_ACTION_VISIT_TYPE"}
            />
            {getErrorByKey(error, "MISSING_VISIT_TYPE")}
          </>
        )}
        <p />
        {isStandard && (
          <AvniSelect
            label={`Select standard card type`}
            value={standardReportCardTypeName}
            onChange={(event) => {
              dispatch({
                type: ReportCardReducerKeys.standardReportCardType,
                payload: standardReportCardTypes.find(
                  (x) => event.target.value === x.name,
                ),
              });
              dispatch({
                type: ReportCardReducerKeys.duration,
                payload: card.isRecentType()
                  ? { value: "1", unit: "days" }
                  : null,
              });
            }}
            style={{ width: "15.625rem" }}
            required
            options={sortBy(standardReportCardTypes, ["description"]).map(
              (type) => ({
                value: type.name,
                label: type.description,
              }),
            )}
            toolTipKey={"APP_DESIGNER_CARD_IS_STANDARD_TYPE"}
          />
        )}
        {isStandard && card.isRecentType() && (
          <ValueTextUnitSelect
            label={`${card.standardReportCardType.description} in the last*`}
            value={get(card, "standardReportCardInputRecentDuration.value")}
            unit={get(card, "standardReportCardInputRecentDuration.unit")}
            units={StandardReportCardType.recentCardDurationUnits.map(
              (unit) => ({
                value: unit,
                label: unit,
              }),
            )}
            onValueChange={(event) =>
              dispatch({
                type: ReportCardReducerKeys.duration,
                payload: {
                  value: event.target.value,
                  unit: card.standardReportCardInputRecentDuration.unit,
                },
              })
            }
            onUnitChange={(event) =>
              dispatch({
                type: ReportCardReducerKeys.duration,
                payload: {
                  value: card.standardReportCardInputRecentDuration.value,
                  unit: event.target.value,
                },
              })
            }
            errorMsg={getErrorByKey(error, "INVALID_DURATION")}
          />
        )}
        {card.isSubjectTypeFilterSupported() && (
          <>
            <p />
            <FormMetaDataSelect
              selectedSubjectTypes={card.standardReportCardInputSubjectTypes}
              selectedPrograms={card.standardReportCardInputPrograms}
              selectedEncounterTypes={
                card.standardReportCardInputEncounterTypes
              }
              onChange={(formMetaData) =>
                dispatch({
                  type: ReportCardReducerKeys.cardFormMetaData,
                  payload: formMetaData,
                })
              }
            />
          </>
        )}
        {showQueryEditor && (
          <Fragment>
            <AvniFormLabel
              label={"Query"}
              toolTipKey={"APP_DESIGNER_CARD_QUERY"}
            />
            <JSEditor
              value={card.query || sampleCardQuery(card.nested)}
              onValueChange={(event) =>
                dispatch({ type: ReportCardReducerKeys.query, payload: event })
              }
            />
          </Fragment>
        )}
        {isFullyCustom && (
          <Fragment>
            <AvniFormLabel
              label="HTML File *"
              toolTipKey={"APP_DESIGNER_CARD_HTML_FILE"}
            />
            {customCardHtmlFileS3Key && !htmlFile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    http.downloadFile(
                      `/customCardConfigFile/${customCardHtmlFileS3Key}`,
                      customCardHtmlFileS3Key,
                    );
                  }}
                >
                  {customCardHtmlFileS3Key}
                </a>
                <Button size="small" variant="outlined" component="label">
                  Replace
                  <input
                    type="file"
                    accept=".html,text/html"
                    style={{ display: "none" }}
                    onChange={(e) => setHtmlFile(e.target.files[0])}
                  />
                </Button>
              </div>
            ) : htmlFile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{htmlFile.name}</span>
                <Button size="small" variant="outlined" component="label">
                  Change
                  <input
                    type="file"
                    accept=".html,text/html"
                    style={{ display: "none" }}
                    onChange={(e) => setHtmlFile(e.target.files[0])}
                  />
                </Button>
              </div>
            ) : (
              <Button size="small" variant="outlined" component="label">
                Upload HTML
                <input
                  type="file"
                  accept=".html,text/html"
                  hidden
                  onChange={(e) => setHtmlFile(e.target.files[0])}
                />
              </Button>
            )}
            {getErrorByKey(error, "MISSING_HTML_FILE")}
            <p />
            <AvniFormLabel
              label={"Data Rule"}
              toolTipKey={"APP_DESIGNER_CARD_DATA_RULE"}
            />
            <JSEditor
              value={customCardDataRule}
              onValueChange={setCustomCardDataRule}
            />
          </Fragment>
        )}
        {getErrorByKey(error, "EMPTY_TYPE")}
        <p />
        {getErrorByKey(error, "EMPTY_QUERY")}
        <p />
        {getErrorByKey(error, "INVALID_NESTED_CARD_COUNT")}
        <br />
        <Grid container direction={"row"}>
          <Grid size={1}>
            <SaveComponent name="save" onSubmit={onSave} />
          </Grid>
          <Grid size={11}>
            {edit && (
              <Button
                style={{ float: "right", color: "red" }}
                onClick={onDelete}
              >
                <DeleteIcon /> Delete
              </Button>
            )}
          </Grid>
        </Grid>
        {hasServerError(error) && (
          <CustomizedSnackbar
            message={getServerError(error).message}
            getDefaultSnackbarStatus={() => setError(removeServerError(error))}
            defaultSnackbarStatus={true}
            autoHideDuration={3000}
            variant={"error"}
          />
        )}
        {!isNil(id) && <Navigate to={`/appDesigner/reportCard/${id}/show`} />}
        {redirectAfterDelete && <Navigate to="/appDesigner/reportCard" />}
      </DocumentationContainer>
    </Box>
  );
};
