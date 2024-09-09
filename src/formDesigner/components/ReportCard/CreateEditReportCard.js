import React from "react";
import { ReportCardReducer, ReportCardReducerKeys } from "./ReportCardReducer";
import http from "../../../common/utils/httpClient";
import { get, isNil, sortBy } from "lodash";
import Box from "@material-ui/core/Box";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { Title } from "react-admin";
import DeleteIcon from "@material-ui/icons/Delete";
import { Redirect } from "react-router-dom";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { sampleCardQuery } from "../../common/SampleRule";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import { AvniSelect } from "../../../common/components/AvniSelect";
import { AvniSwitch } from "../../../common/components/AvniSwitch";
import { AvniImageUpload } from "../../../common/components/AvniImageUpload";
import { bucketName, uploadImage } from "../../../common/utils/S3Client";
import { getErrorByKey } from "../../common/ErrorUtil";
import { JSEditor } from "../../../common/components/JSEditor";
import { PopoverColorPicker } from "../../../common/components/PopoverColorPicker";
import WebReportCard from "../../../common/model/WebReportCard";
import DashboardService from "../../../common/service/DashboardService";
import FormMetaDataSelect from "../../../common/components/FormMetaDataSelect";
import { StandardReportCardType } from "openchs-models";
import { ValueTextUnitSelect } from "../../../common/components/ValueTextUnitSelect";

export const CreateEditReportCard = ({ edit, ...props }) => {
  const [card, dispatch] = React.useReducer(ReportCardReducer, WebReportCard.createNewReportCard());
  const [error, setError] = React.useState([]);
  const [id, setId] = React.useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = React.useState(false);
  const [isStandardReportCard, setIsStandardReportCard] = React.useState(false);
  const [standardReportCardTypes, setStandardReportCardTypes] = React.useState([]);
  const [file, setFile] = React.useState();

  React.useEffect(() => {
    if (edit) {
      DashboardService.getReportCard(props.match.params.id).then(res => {
        dispatch({ type: ReportCardReducerKeys.setData, payload: res });
      });
    }
  }, []);

  React.useEffect(() => {
    if (edit) {
      setIsStandardReportCard(!isNil(card.standardReportCardType));
    }
  }, [isNil(card.standardReportCardType)]);

  React.useEffect(() => {
    DashboardService.getStandardReportCardTypes().then(setStandardReportCardTypes);
  }, []);

  React.useEffect(() => {
    if (isStandardReportCard) {
      dispatch({ type: ReportCardReducerKeys.query, payload: null });
      dispatch({ type: ReportCardReducerKeys.nested, payload: { nested: false, count: WebReportCard.MinimumNumberOfNestedCards } });
    } else {
      dispatch({ type: ReportCardReducerKeys.standardReportCardType, payload: null });
    }
  }, [isStandardReportCard]);

  React.useEffect(() => {
    //to handle existing recent type cards without duration configured
    if (card.isRecentType() && isNil(card.standardReportCardInputRecentDuration)) {
      dispatch({ type: ReportCardReducerKeys.duration, payload: { value: "1", unit: "days" } });
    }
  }, [card]);

  const validateRequest = () => {
    const errors = card.validateCard(isStandardReportCard);
    console.log(errors);
    setError(errors);
    return errors.length === 0;
  };

  const onSave = async () => {
    if (validateRequest()) {
      const [s3FileKey, error] = await uploadImage(card.iconFileS3Key, file, bucketName.ICONS);
      if (error) {
        alert(error);
        return;
      }
      card.iconFileS3Key = s3FileKey;

      DashboardService.saveReportCard(card)
        .then(res => {
          if (res.status === 200) {
            setId(res.data.id);
          }
        })
        .catch(error => {
          setError([
            {
              key: "SERVER_ERROR",
              message: `${get(error, "response.data") || get(error, "message") || "error while saving card"}`
            }
          ]);
        });
    }
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete card record?")) {
      http.delete(`/web/reportCard/${props.match.params.id}`).then(response => {
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

  const standardReportCardTypeName = get(card, "standardReportCardType.name") || "";

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Title title={"Create offline Card"} />
      <DocumentationContainer filename={"Card.md"}>
        {edit && (
          <Grid container style={{ justifyContent: "flex-end" }}>
            <Button color="primary" type="button" onClick={() => setId(props.match.params.id)}>
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
          onChange={event => onChange(ReportCardReducerKeys.name, event, "EMPTY_NAME")}
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
          onChange={event => dispatch({ type: ReportCardReducerKeys.description, payload: event.target.value })}
          toolTipKey={"APP_DESIGNER_CARD_DESCRIPTION"}
        />
        <p />
        <AvniFormLabel label={"Colour Picker"} toolTipKey={"APP_DESIGNER_CARD_COLOR"} />
        <PopoverColorPicker
          id="colour"
          label="Colour"
          color={card.colour}
          onChange={color => dispatch({ type: ReportCardReducerKeys.color, payload: color })}
        />
        {getErrorByKey(error, "EMPTY_COLOR")}
        <p />
        <AvniImageUpload
          onSelect={setFile}
          label={"Icon"}
          toolTipKey={"APP_DESIGNER_CARD_ICON"}
          width={75}
          height={75}
          oldImgUrl={card.iconFileS3Key}
          allowUpload={true}
        />
        <p />
        <AvniSwitch
          checked={isStandardReportCard}
          onChange={event => setIsStandardReportCard(!isStandardReportCard)}
          name="Is Standard Report Card?"
          toolTipKey={"APP_DESIGNER_CARD_IS_STANDARD_TYPE"}
        />
        <p />
        {getErrorByKey(error, "EMPTY_NESTED")}
        {!isStandardReportCard && (
          <AvniSwitch
            checked={!isStandardReportCard && card.nested}
            onChange={event =>
              dispatch({
                type: ReportCardReducerKeys.nested,
                payload: { nested: !card.nested, count: WebReportCard.MinimumNumberOfNestedCards }
              })
            }
            name="Is Nested Report Card?"
            toolTipKey={"APP_DESIGNER_CARD_IS_NESTED"}
          />
        )}
        <p />
        {!isStandardReportCard && card.nested && (
          <AvniSelect
            label="Count of Nested Cards"
            value={card.count}
            style={{ width: "200px" }}
            required={!isStandardReportCard && card.nested}
            onChange={event =>
              dispatch({
                type: ReportCardReducerKeys.nested,
                payload: { nested: card.nested, count: event.target.value }
              })
            }
            options={Array.from({ length: WebReportCard.MaximumNumberOfNestedCards }, (_, i) => i + 1).map((num, index) => (
              <MenuItem value={num} key={index}>
                {num}
              </MenuItem>
            ))}
            toolTipKey={"APP_DESIGNER_CARD_COUNT"}
          />
        )}
        <p />
        {isStandardReportCard && (
          <AvniSelect
            label={`Select standard card type ${isStandardReportCard ? "*" : ""}`}
            value={standardReportCardTypeName}
            onChange={event => {
              dispatch({
                type: ReportCardReducerKeys.standardReportCardType,
                payload: standardReportCardTypes.find(x => event.target.value === x.name)
              });
              dispatch({
                type: ReportCardReducerKeys.duration,
                payload: card.isRecentType() ? { value: "1", unit: "days" } : null
              });
            }}
            style={{ width: "250px" }}
            required
            options={sortBy(standardReportCardTypes, ["description"]).map((type, index) => (
              <MenuItem value={type.name} key={index}>
                {type.description}
              </MenuItem>
            ))}
            toolTipKey={"APP_DESIGNER_CARD_IS_STANDARD_TYPE"}
          />
        )}
        {isStandardReportCard && card.isRecentType() && (
          <ValueTextUnitSelect
            label={`${card.standardReportCardType.description} in the last*`}
            value={get(card, "standardReportCardInputRecentDuration.value")}
            unit={get(card, "standardReportCardInputRecentDuration.unit")}
            units={StandardReportCardType.recentCardDurationUnits.map((unit, index) => (
              <MenuItem value={unit} key={index}>
                {unit}
              </MenuItem>
            ))}
            onValueChange={event =>
              dispatch({
                type: ReportCardReducerKeys.duration,
                payload: { value: event.target.value, unit: card.standardReportCardInputRecentDuration.unit }
              })
            }
            onUnitChange={event =>
              dispatch({
                type: ReportCardReducerKeys.duration,
                payload: { value: card.standardReportCardInputRecentDuration.value, unit: event.target.value }
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
              selectedEncounterTypes={card.standardReportCardInputEncounterTypes}
              onChange={formMetaData => dispatch({ type: ReportCardReducerKeys.cardFormMetaData, payload: formMetaData })}
            />
          </>
        )}
        {!isStandardReportCard && (
          <React.Fragment>
            <AvniFormLabel label={"Query"} toolTipKey={"APP_DESIGNER_CARD_QUERY"} />
            <JSEditor
              value={card.query || sampleCardQuery(card.nested)}
              onValueChange={event => dispatch({ type: ReportCardReducerKeys.query, payload: event })}
            />
          </React.Fragment>
        )}
        {getErrorByKey(error, "EMPTY_TYPE")}
        <p />
        {getErrorByKey(error, "EMPTY_QUERY")}
        <p />
        {getErrorByKey(error, "SERVER_ERROR")}
        <p />
        {getErrorByKey(error, "DISALLOWED_NESTED")}
        <p />
        {getErrorByKey(error, "INVALID_NESTED_CARD_COUNT")}
        <br />
        <Grid container direction={"row"}>
          <Grid item xs={1}>
            <SaveComponent name="save" onSubmit={onSave} />
          </Grid>
          <Grid item xs={11}>
            {edit && (
              <Button style={{ float: "right", color: "red" }} onClick={onDelete}>
                <DeleteIcon /> Delete
              </Button>
            )}
          </Grid>
        </Grid>
        {!isNil(id) && <Redirect to={`/appDesigner/reportCard/${id}/show`} />}
        {redirectAfterDelete && <Redirect to="/appDesigner/reportCard" />}
      </DocumentationContainer>
    </Box>
  );
};
