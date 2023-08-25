import React from "react";
import { ReportCardReducer } from "./ReportCardReducer";
import http from "../../../common/utils/httpClient";
import _, { get, isEmpty, isNil } from "lodash";
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
import ColorPicker from "material-ui-rc-color-picker";
import { colorPickerCSS } from "../../../adminApp/Constant";
import { sampleCardQuery } from "../../common/SampleRule";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import { AvniSelect } from "../../../common/components/AvniSelect";
import { AvniSwitch } from "../../../common/components/AvniSwitch";
import { AvniImageUpload } from "../../../common/components/AvniImageUpload";
import { bucketName, uploadImage } from "../../../common/utils/S3Client";
import { getErrorByKey } from "../../common/ErrorUtil";
import { JSEditor } from "../../../common/components/JSEditor";

const initialState = {
  name: "",
  description: "",
  color: "#ff0000",
  query: "",
  iconFileS3Key: "",
  standardReportCardType: {}
};
export const CreateEditReportCard = ({ edit, ...props }) => {
  const [card, dispatch] = React.useReducer(ReportCardReducer, initialState);
  const [error, setError] = React.useState([]);
  const [id, setId] = React.useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = React.useState(false);
  const [isStandardReportCard, setIsStandardReportCard] = React.useState(false);
  const [standardReportCardTypes, setStandardReportCardTypes] = React.useState([]);
  const [file, setFile] = React.useState();

  React.useEffect(() => {
    if (edit) {
      http
        .get(`/web/card/${props.match.params.id}`)
        .then(res => res.data)
        .then(res => {
          dispatch({ type: "setData", payload: res });
        });
    }
  }, []);

  React.useEffect(() => {
    if (card.standardReportCardTypeId != null) {
      http
        .get(`/web/standardReportCardType/${card.standardReportCardTypeId}`)
        .then(res => res.data)
        .then(res => {
          dispatch({ type: "setData", payload: { ...card } });
          setIsStandardReportCard(true);
        });
    }
  }, [card.standardReportCardTypeId]);

  React.useEffect(() => {
    http
      .get("/web/standardReportCardType")
      .then(res => res.data)
      .then(res => {
        setStandardReportCardTypes(res.map(({ name, id }) => ({ name, id })));
      });
  }, []);

  React.useEffect(() => {
    if (!_.isEmpty(standardReportCardTypes) && card.standardReportCardTypeId != null) {
      dispatch({
        type: "standardReportCardType",
        payload: standardReportCardTypes.find(x => x.id === card.standardReportCardTypeId)
      });
    }
  }, [standardReportCardTypes, card.standardReportCardTypeId]);

  React.useEffect(() => {
    if (isStandardReportCard) {
      dispatch({ type: "query", payload: null });
    } else {
      dispatch({ type: "standardReportCardType", payload: null });
    }
  }, [isStandardReportCard]);

  const validateRequest = () => {
    const { name, color, query, standardReportCardType } = card;
    let isValid = true;
    setError([]);
    if (isEmpty(name)) {
      setError([...error, { key: "EMPTY_NAME", message: "Name cannot be empty" }]);
      isValid = false;
    }
    if (isEmpty(color)) {
      setError([...error, { key: "EMPTY_COLOR", message: "Colour cannot be empty" }]);
      isValid = false;
    }
    if (isStandardReportCard && isEmpty(standardReportCardType)) {
      setError([...error, { key: "EMPTY_TYPE", message: "Standard Report Type cannot be empty" }]);
      isValid = false;
    }
    if (!isStandardReportCard && isEmpty(query)) {
      setError([...error, { key: "EMPTY_QUERY", message: "Query cannot be empty" }]);
      isValid = false;
    }
    return isValid;
  };

  const onSave = async () => {
    if (validateRequest()) {
      const [s3FileKey, error] = await uploadImage(card.iconFileS3Key, file, bucketName.ICONS);
      if (error) {
        alert(error);
        return;
      }
      const url = edit ? `/web/card/${props.match.params.id}` : "/web/card";
      const methodName = edit ? "put" : "post";
      return http[methodName](url, {
        name: card.name,
        description: card.description,
        color: card.color,
        query: card.query,
        standardReportCardTypeId: card.standardReportCardType && card.standardReportCardType.id,
        iconFileS3Key: s3FileKey
      })
        .then(res => {
          if (res.status === 200) {
            setId(res.data.id);
          }
        })
        .catch(error => {
          setError([
            {
              key: "SERVER_ERROR",
              message: `${get(error, "response.data") ||
                get(error, "message") ||
                "error while saving card"}`
            }
          ]);
        });
    }
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete card record?")) {
      http.delete(`/web/card/${props.match.params.id}`).then(response => {
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
          onChange={event => onChange("name", event, "EMPTY_NAME")}
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
          onChange={event => dispatch({ type: "description", payload: event.target.value })}
          toolTipKey={"APP_DESIGNER_CARD_DESCRIPTION"}
        />
        <p />
        <AvniFormLabel label={"Colour Picker"} toolTipKey={"APP_DESIGNER_CARD_COLOR"} />
        <ColorPicker
          id="colour"
          label="Colour"
          style={colorPickerCSS}
          color={card.color}
          onChange={color => dispatch({ type: "color", payload: color.color })}
        />
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
        {getErrorByKey(error, "EMPTY_COLOR")}
        <AvniSwitch
          checked={isStandardReportCard}
          onChange={event => setIsStandardReportCard(!isStandardReportCard)}
          name="Is Standard Report Card?"
          toolTipKey={"APP_DESIGNER_CARD_IS_STANDARD_TYPE"}
        />
        <p />
        {isStandardReportCard && (
          <AvniSelect
            label={`Select standard card type ${isStandardReportCard ? "*" : ""}`}
            value={_.isEmpty(card.standardReportCardType) ? "" : card.standardReportCardType}
            onChange={event => {
              dispatch({ type: "standardReportCardType", payload: event.target.value });
            }}
            style={{ width: "200px" }}
            required
            options={standardReportCardTypes.map((type, index) => (
              <MenuItem value={type} key={index}>
                {type.name}
              </MenuItem>
            ))}
            toolTipKey={"APP_DESIGNER_CARD_IS_STANDARD_TYPE"}
          />
        )}
        {!isStandardReportCard && (
          <React.Fragment>
            <AvniFormLabel label={"Query"} toolTipKey={"APP_DESIGNER_CARD_QUERY"} />
            <JSEditor
              value={card.query || sampleCardQuery()}
              onValueChange={event => dispatch({ type: "query", payload: event })}
            />
          </React.Fragment>
        )}
        {getErrorByKey(error, "EMPTY_TYPE")}
        <p />
        {getErrorByKey(error, "EMPTY_QUERY")}
        <p />
        {getErrorByKey(error, "SERVER_ERROR")}
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
