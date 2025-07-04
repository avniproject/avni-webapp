import { memo, Fragment } from "react";
import { styled } from "@mui/material/styles";
import {
  FormControl as MuiFormControl,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Input,
  InputLabel,
  Paper,
  Select,
  Grid,
  MenuItem,
  TextField,
  Radio,
  RadioGroup,
  Chip
} from "@mui/material";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import InlineConcept from "./InlineConcept";
import _, { capitalize, get, includes, isNil, replace, toNumber, areEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { AvniFormControl } from "../../common/components/AvniFormControl";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { pickers } from "../../common/constants";
import { FileOptions } from "./FileOptions";
import SubjectFormElementKeyValues from "./SubjectFormElementKeyValues";
import QuestionGroup from "./QuestionGroup";
import DocumentationSearch from "../../documentation/components/DocumentationSearch";
import { ColourStyle } from "./ColourStyle";
import { Privilege } from "openchs-models";
import { connect } from "react-redux";
import UserInfo from "../../common/model/UserInfo";

export const StyledFormControl = styled(MuiFormControl)({
  paddingBottom: 10,
  width: "100%"
});

const StyledFormControlNarrow = styled(MuiFormControl)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 120
}));

const StyledPaper = styled(Paper)({
  width: "100%",
  marginBottom: "15px"
});

const StyledHeader = styled("div")({
  backgroundColor: "#2a96f3",
  color: "white",
  height: "30px",
  display: "flex",
  alignItems: "center"
});

const StyledHeaderText = styled("span")({
  marginLeft: "10px",
  fontSize: "small"
});

const StyledContainer = styled("div")({
  marginLeft: "15px",
  marginRight: "15px",
  marginTop: "15px",
  marginBottom: "15px"
});

const StyledErrorText = styled("div")({
  color: "red"
});

const StyledFormLabel = styled(FormLabel)({
  fontSize: "13px"
});

const StyledLink = styled("a")({
  color: "black",
  textDecoration: "none"
});

const StyledChipContainer = styled("div")({
  paddingTop: 10
});

const showPicker = (pickerType, props, disableFormElement) => {
  const picker = pickers.find(picker => picker.type === pickerType);
  const pickerModes = picker.modes.map(mode => (
    <FormControlLabel key={mode.id} value={mode.id} control={<Radio />} label={mode.name} disabled={disableFormElement} />
  ));

  return (
    <Grid container sm={12}>
      <AvniFormLabel label={picker.label} toolTipKey={picker.toolTipKey} sx={{ mt: 1.5, mr: 1, color: "black" }} />
      <RadioGroup
        aria-label={picker.label}
        name={picker.key}
        value={props.formElementData.keyValues[picker.key]}
        onChange={event => props.handleGroupElementKeyValueChange(props.groupIndex, picker.key, event.target.value, props.index)}
        row
      >
        {pickerModes}
      </RadioGroup>
    </Grid>
  );
};

export const BackButton = ({ style, ...props }) => {
  return (
    <Button
      size="small"
      variant="outlined"
      sx={style}
      onClick={() => props.handleConceptFormLibrary(props.groupIndex, "", props.elementIndex, true)}
    >
      Cancel
    </Button>
  );
};

export const multiSelectFormElementConceptDataTypes = ["Coded", "Subject", "Image", "ImageV2", "Video", "File", "Encounter"];

const FormElementDetails = ({ userInfo, ...props }) => {
  const { t } = useTranslation();
  const disableFormElement = props.disableFormElement;
  const dataTypesToIgnore = props.ignoreDataTypes || [];

  const onChangeAnswerName = (answerName, index, flag = true) => {
    if (flag) {
      props.handleGroupElementChange(props.groupIndex, "concept", answerName, props.index);
      if (props.formElementData.name === "") {
        props.handleGroupElementChange(props.groupIndex, "name", answerName.name, props.index);
      }
    } else {
      props.updateConceptElementData(props.groupIndex, "name", answerName, props.index);
    }
  };

  const identifierSourceList = () =>
    props.identifierSources.map(idSource => (
      <MenuItem key={idSource.value} value={idSource.value}>
        {idSource.label}
      </MenuItem>
    ));

  const groupSubjectTypeList = () =>
    props.groupSubjectTypes.map(({ name, uuid }) => (
      <MenuItem key={uuid} value={uuid}>
        {name}
      </MenuItem>
    ));

  const groupRoleList = () => {
    const selectedGroupSubjectType = props.groupSubjectTypes.find(
      ({ uuid }) => uuid === props.formElementData.keyValues.groupSubjectTypeUUID
    );
    return (selectedGroupSubjectType?.groupRoles || []).map(({ role, uuid }) => (
      <MenuItem key={uuid} value={uuid}>
        {role}
      </MenuItem>
    ));
  };

  const renderDurationOptions = () => {
    const durations = ["years", "months", "weeks", "days", "hours", "minutes"];
    return durations.map(duration => (
      <FormControlLabel
        key={duration}
        control={
          <Checkbox
            checked={props.formElementData.keyValues.durationOptions?.includes(duration) || false}
            value={duration}
            onChange={event => props.handleGroupElementKeyValueChange(props.groupIndex, duration, event.target.value, props.index)}
          />
        }
        label={capitalize(duration)}
      />
    ));
  };

  return (
    <Fragment>
      <Grid container sm={12}>
        {props.formElementData.errorMessage?.name && <StyledErrorText>Please enter name</StyledErrorText>}
        {props.formElementData.errorMessage?.ruleError && <StyledErrorText>Please check the rule validation errors</StyledErrorText>}
        <StyledFormControl>
          <AvniFormLabel label={t("Question")} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_NAME"} />
          <Input
            id="elementNameDetails"
            value={props.formElementData.name}
            onChange={event => props.handleGroupElementChange(props.groupIndex, "name", replace(event.target.value, "|", ""), props.index)}
            disabled={disableFormElement}
          />
        </StyledFormControl>
        <StyledPaper>
          <StyledHeader>
            <StyledHeaderText>CONCEPT</StyledHeaderText>
          </StyledHeader>
          {props.formElementData.showConceptLibrary === "" && (
            <StyledContainer>
              <Button
                color="primary"
                type="button"
                onClick={() => props.handleConceptFormLibrary(props.groupIndex, "chooseFromLibrary", props.index)}
                disabled={disableFormElement}
              >
                Select from library
              </Button>
              <br />
              OR
              <br />
              {UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditConcept) && (
                <Button
                  color="primary"
                  type="button"
                  onClick={() => props.handleConceptFormLibrary(props.groupIndex, "addNewConcept", props.index)}
                  disabled={disableFormElement}
                >
                  Create new
                </Button>
              )}
            </StyledContainer>
          )}
          {props.formElementData.showConceptLibrary === "addNewConcept" && (
            <StyledContainer>
              <InlineConcept
                onSaveInlineConcept={props.onSaveInlineConcept}
                formElementData={props.formElementData}
                index={props.index}
                groupIndex={props.groupIndex}
                handleGroupElementChange={props.handleGroupElementChange}
                handleInlineNumericAttributes={props.handleInlineNumericAttributes}
                handleInlineCodedConceptAnswers={props.handleInlineCodedConceptAnswers}
                onToggleInlineConceptCodedAnswerAttribute={props.onToggleInlineConceptCodedAnswerAttribute}
                onDeleteInlineConceptCodedAnswerDelete={props.onDeleteInlineConceptCodedAnswerDelete}
                onMoveUp={props.onMoveUp}
                onMoveDown={props.onMoveDown}
                onAlphabeticalSort={props.onAlphabeticalSort}
                handleInlineCodedAnswerAddition={props.handleInlineCodedAnswerAddition}
                handleInlineLocationAttributes={props.handleInlineLocationAttributes}
                handleInlineSubjectAttributes={props.handleInlineSubjectAttributes}
                handleInlineEncounterAttributes={props.handleInlineEncounterAttributes}
                handleInlinePhoneNumberAttributes={props.handleInlinePhoneNumberAttributes}
                handleConceptFormLibrary={props.handleConceptFormLibrary}
                dataTypesToIgnore={dataTypesToIgnore}
                onSelectAnswerMedia={props.onSelectAnswerMedia}
              />
            </StyledContainer>
          )}
          {props.formElementData.showConceptLibrary === "chooseFromLibrary" && (
            <StyledContainer>
              <Grid sm={12}>
                {props.formElementData.errorMessage?.concept && <StyledErrorText>Please enter concept</StyledErrorText>}
                <StyledFormControl>
                  {props.formElementData.newFlag ? (
                    <AutoSuggestSingleSelection
                      visibility={!props.formElementData.newFlag}
                      showAnswer={props.formElementData.concept}
                      onChangeAnswerName={onChangeAnswerName}
                      finalReturn={true}
                      index={0}
                      label="Concept"
                      dataTypesToIgnore={dataTypesToIgnore}
                    />
                  ) : (
                    <>
                      <StyledFormLabel>Concept*</StyledFormLabel>
                      {disableFormElement ? (
                        props.formElementData.concept.name
                      ) : (
                        <StyledLink href={`#/appDesigner/concept/${props.formElementData.concept.uuid}/show`}>
                          {props.formElementData.concept.name}
                        </StyledLink>
                      )}
                    </>
                  )}
                </StyledFormControl>
              </Grid>
              {props.formElementData.concept.dataType !== "Coded" && <Grid sm={6} />}
              {props.formElementData.concept.dataType === "Numeric" && (
                <Grid container sm={12}>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel label={"Low Absolute"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_LOW_ABSOLUTE"} />
                      <Input
                        disableUnderline
                        value={isNil(props.formElementData.concept.lowAbsolute) ? "N.A" : props.formElementData.concept.lowAbsolute}
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel label={"High Absolute"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_HIGH_ABSOLUTE"} />
                      <Input
                        disableUnderline
                        value={isNil(props.formElementData.concept.highAbsolute) ? "N.A" : props.formElementData.concept.highAbsolute}
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel label={"Low normal"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_LOW_NORMAL"} />
                      <Input
                        disableUnderline
                        value={isNil(props.formElementData.concept.lowNormal) ? "N.A" : props.formElementData.concept.lowNormal}
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel label={"High normal"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_HIGH_NORMAL"} />
                      <Input
                        disableUnderline
                        value={isNil(props.formElementData.concept.highNormal) ? "N.A" : props.formElementData.concept.highNormal}
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel label={"Unit"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_UNIT"} />
                      <Input
                        disableUnderline
                        value={isNil(props.formElementData.concept.unit) ? "N.A" : props.formElementData.concept.unit}
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                </Grid>
              )}
              {props.formElementData.concept.dataType === "Coded" && (
                <Grid container sm={12}>
                  <StyledChipContainer>
                    <InputLabel>Answers:</InputLabel>
                    {_.orderBy(props.formElementData.concept.answers, "order").map(d =>
                      !d.excluded && !d.voided ? (
                        <Chip
                          key={d.name}
                          label={
                            disableFormElement ? (
                              d.name
                            ) : (
                              <StyledLink href={`#/appDesigner/concept/${d.uuid}/show`}>
                                <span>{d.name}</span>
                              </StyledLink>
                            )
                          }
                          onDelete={() =>
                            disableFormElement ? _.noop() : props.handleExcludedAnswers(d.name, true, props.groupIndex, props.index)
                          }
                        />
                      ) : null
                    )}
                  </StyledChipContainer>
                </Grid>
              )}
              {props.formElementData.newFlag && (
                <BackButton
                  handleConceptFormLibrary={props.handleConceptFormLibrary}
                  groupIndex={props.groupIndex}
                  elementIndex={props.index}
                />
              )}
            </StyledContainer>
          )}
        </StyledPaper>
        {includes(multiSelectFormElementConceptDataTypes, props.formElementData.concept.dataType) && (
          <Grid sm={6}>
            {props.formElementData.errorMessage?.type && <StyledErrorText>Please select type</StyledErrorText>}
            <StyledFormControl disabled={disableFormElement}>
              <AvniFormLabel label={"Type"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_CODED_TYPE"} />
              <Select
                name="type"
                value={props.formElementData.type}
                onChange={event => props.handleGroupElementChange(props.groupIndex, "type", event.target.value, props.index)}
                required
              >
                <MenuItem value="SingleSelect">SingleSelect</MenuItem>
                <MenuItem value="MultiSelect">MultiSelect</MenuItem>
              </Select>
            </StyledFormControl>
            {props.formElementData.errorMessage?.disallowedChangeError && (
              <StyledErrorText sx={{ fontSize: "smaller" }}>
                Changing type is not allowed. Please replace this question with a new one, associate it with a different concept and set the
                required type.
                <br />
                If this change is absolutely required, please contact support team.
              </StyledErrorText>
            )}
          </Grid>
        )}
        <StyledFormControl>
          <AvniFormLabel label={t("Documentation")} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DOCUMENTATION"} />
          <DocumentationSearch
            value={props.formElementData.documentation}
            onChange={documentation => props.handleGroupElementChange(props.groupIndex, "documentation", documentation, props.index)}
          />
        </StyledFormControl>
        {props.formElementData.concept.dataType === "Coded" && (
          <Grid container sm={12}>
            <StyledChipContainer>
              <InputLabel>Excluded Answers:</InputLabel>
              {props.formElementData.concept.answers.map(d =>
                d.excluded && !d.voided ? (
                  <Chip
                    key={d.name}
                    label={
                      disableFormElement ? (
                        d.name
                      ) : (
                        <StyledLink href={`#/appDesigner/concept/${d.uuid}/show`}>
                          <span>{d.name}</span>
                        </StyledLink>
                      )
                    }
                    onDelete={() =>
                      disableFormElement ? _.noop() : props.handleExcludedAnswers(d.name, false, props.groupIndex, props.index)
                    }
                  />
                ) : null
              )}
            </StyledChipContainer>
          </Grid>
        )}
        {props.formElementData.concept.dataType === "Video" && (
          <Grid container sm={12}>
            <Grid sm={4}>
              <TextField
                type="number"
                name="durationLimitInSecs"
                label="Duration limit(seconds)"
                placeholder="60"
                value={props.formElementData.keyValues.durationLimitInSecs}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(props.groupIndex, "durationLimitInSecs", event.target.value, props.index)
                }
                margin="normal"
                inputProps={{ min: 0 }}
                disabled={disableFormElement}
              />
              {props.formElementData.errorMessage?.durationLimitInSecs && <StyledErrorText>Please enter positive number</StyledErrorText>}
            </Grid>
            <Grid sm={1} />
            <Grid sm={3}>
              <StyledFormControlNarrow disabled={disableFormElement}>
                <AvniFormLabel label={"Video Quality"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_VIDEO_QUALITY"} />
                <Select
                  name="videoQuality"
                  value={props.formElementData.keyValues.videoQuality ?? "high"}
                  onChange={event =>
                    props.handleGroupElementKeyValueChange(props.groupIndex, "videoQuality", event.target.value, props.index)
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </StyledFormControlNarrow>
            </Grid>
          </Grid>
        )}
        {props.formElementData.concept.dataType === "File" && (
          <FileOptions
            keyValues={props.formElementData.keyValues}
            handleChange={props.handleGroupElementKeyValueChange}
            groupIndex={props.groupIndex}
            index={props.index}
          />
        )}
        {(props.formElementData.concept.dataType === "Image" || props.formElementData.concept.dataType === "ImageV2") && (
          <Grid container sm={12}>
            <Grid sm={3}>
              <TextField
                name="maxHeight"
                type="number"
                label="Max Height"
                placeholder="960"
                value={props.formElementData.keyValues.maxHeight}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(props.groupIndex, "maxHeight", toNumber(event.target.value), props.index)
                }
                margin="normal"
                inputProps={{ min: 0 }}
                disabled={disableFormElement}
              />
              {props.formElementData.errorMessage?.maxHeight && <StyledErrorText>Please enter positive number</StyledErrorText>}
            </Grid>
            <Grid sm={1} />
            <Grid sm={3}>
              <TextField
                type="number"
                name="maxWidth"
                label="Max Width"
                placeholder="1280"
                value={props.formElementData.keyValues.maxWidth}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(props.groupIndex, "maxWidth", toNumber(event.target.value), props.index)
                }
                margin="normal"
                inputProps={{ min: 0 }}
                disabled={disableFormElement}
              />
              {props.formElementData.errorMessage?.maxWidth && <StyledErrorText>Please enter positive number</StyledErrorText>}
            </Grid>
            <Grid sm={1} />
            <Grid sm={3}>
              <StyledFormControlNarrow disabled={disableFormElement}>
                <AvniFormLabel label={"Image Quality"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_IMAGE_QUALITY"} />
                <Select
                  name="imageQuality"
                  value={props.formElementData.keyValues.imageQuality ?? 1}
                  onChange={event =>
                    props.handleGroupElementKeyValueChange(props.groupIndex, "imageQuality", toNumber(event.target.value), props.index)
                  }
                >
                  <MenuItem value="0.5">Low</MenuItem>
                  <MenuItem value="1">High</MenuItem>
                </Select>
              </StyledFormControlNarrow>
            </Grid>
          </Grid>
        )}
        {props.formElementData.concept.dataType === "Date" && showPicker("date", props, disableFormElement)}
        {props.formElementData.errorMessage?.durationOptions && (
          <StyledErrorText sx={{ fontSize: "13px" }}>Duration options must be selected.</StyledErrorText>
        )}
        {["Date", "Duration"].includes(props.formElementData.concept.dataType) && (
          <Grid container sm={12}>
            <AvniFormLabel
              label={"Duration Options"}
              toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DURATION_OPTIONS"}
              sx={{ mt: 1.5, mr: 1, color: "black" }}
            />
            <StyledFormControl component="fieldset" disabled={disableFormElement}>
              <FormGroup row>{renderDurationOptions()}</FormGroup>
            </StyledFormControl>
          </Grid>
        )}
        {props.formElementData.concept.dataType === "DateTime" && showPicker("date", props, disableFormElement)}
        {props.formElementData.concept.dataType === "Time" && showPicker("time", props, disableFormElement)}
        {["Text"].includes(props.formElementData.concept.dataType) && (
          <Grid sm={12}>
            {props.formElementData.errorMessage?.validFormat && (
              <StyledErrorText>Validation Regex and description key both must be empty or both must be filled</StyledErrorText>
            )}
            <StyledFormControl disabled={disableFormElement}>
              <AvniFormLabel label={"Validation Regex"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_VALIDATION_REGEX"} />
              <Input
                id="validFormatRegex"
                value={get(props.formElementData, "validFormat.regex", "")}
                onChange={event => props.handleGroupElementKeyValueChange(props.groupIndex, "regex", event.target.value, props.index)}
              />
            </StyledFormControl>
            <StyledFormControl disabled={disableFormElement}>
              <AvniFormLabel label={"Validation Description Key"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_VALIDATION_DESCRIPTION_KEY"} />
              <Input
                id="validFormatDescriptionKey"
                value={get(props.formElementData, "validFormat.descriptionKey", "")}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(props.groupIndex, "descriptionKey", event.target.value, props.index)
                }
              />
            </StyledFormControl>
          </Grid>
        )}
        <Grid container sm={12}>
          {props.formElementData.concept.dataType !== "QuestionGroup" && (
            <Grid sm={4}>
              <AvniFormControl toolTipKey={"APP_DESIGNER_FORM_ELEMENT_MANDATORY"} disabled={disableFormElement}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="mandatoryDetails"
                      checked={!!props.formElementData.mandatory}
                      value={props.formElementData.mandatory ? "yes" : "no"}
                      onChange={event =>
                        props.handleGroupElementChange(
                          props.groupIndex,
                          "mandatory",
                          event.target.value === "yes" ? false : true,
                          props.index
                        )
                      }
                    />
                  }
                  label="Mandatory"
                />
              </AvniFormControl>
            </Grid>
          )}
          {props.formElementData.concept.dataType === "Subject" && <SubjectFormElementKeyValues {...props} />}
          <Grid sm={4}>
            {["Numeric", "Text", "Date", "DateTime", "Time", "Coded"].includes(props.formElementData.concept.dataType) && (
              <AvniFormControl toolTipKey={"APP_DESIGNER_FORM_ELEMENT_READ_ONLY"} disabled={disableFormElement}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="editable"
                      checked={props.formElementData.keyValues.editable ?? false}
                      onChange={event =>
                        props.handleGroupElementKeyValueChange(
                          props.groupIndex,
                          "editable",
                          !props.formElementData.keyValues.editable,
                          props.index
                        )
                      }
                    />
                  }
                  label="Read Only"
                />
              </AvniFormControl>
            )}
          </Grid>
          {["Numeric", "Text", "PhoneNumber"].includes(props.formElementData.concept.dataType) && (
            <Grid sm={4}>
              <AvniFormControl toolTipKey={"APP_DESIGNER_FORM_ELEMENT_UNIQUE"} disabled={disableFormElement}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="unique"
                      checked={!!props.formElementData.keyValues.unique}
                      onChange={event =>
                        props.handleGroupElementKeyValueChange(props.groupIndex, "unique", event.target.checked, props.index)
                      }
                    />
                  }
                  label="Unique"
                />
              </AvniFormControl>
            </Grid>
          )}
        </Grid>
        {props.formElementData.concept.dataType === "Id" && (
          <Grid sm={6}>
            <StyledFormControl disabled={disableFormElement}>
              <AvniFormLabel label={"Identifier Source"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_IDENTIFIER_SOURCE"} />
              <Select
                name="identifierSource"
                value={props.formElementData.keyValues.IdSourceUUID}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(props.groupIndex, "IdSourceUUID", event.target.value, props.index)
                }
                required
              >
                {identifierSourceList()}
              </Select>
            </StyledFormControl>
          </Grid>
        )}
        {props.formElementData.concept.dataType === "GroupAffiliation" && (
          <Grid container spacing={5}>
            <Grid sm={6}>
              <StyledFormControl disabled={disableFormElement}>
                <AvniFormLabel label={"Group Subject Type"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_SUBJECT_TYPE"} />
                <Select
                  name="groupSubjectType"
                  value={props.formElementData.keyValues.groupSubjectTypeUUID}
                  onChange={event =>
                    props.handleGroupElementKeyValueChange(props.groupIndex, "groupSubjectTypeUUID", event.target.value, props.index)
                  }
                  required
                >
                  {groupSubjectTypeList()}
                </Select>
              </StyledFormControl>
            </Grid>
            <Grid sm={6}>
              {props.formElementData.keyValues.groupSubjectTypeUUID && (
                <StyledFormControl disabled={disableFormElement}>
                  <AvniFormLabel label={"Group Role"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_ROLE"} />
                  <Select
                    name="groupSubjectRole"
                    value={props.formElementData.keyValues.groupSubjectRoleUUID}
                    onChange={event =>
                      props.handleGroupElementKeyValueChange(props.groupIndex, "groupSubjectRoleUUID", event.target.value, props.index)
                    }
                    required
                  >
                    {groupRoleList()}
                  </Select>
                </StyledFormControl>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
      {props.formElementData.concept.dataType === "QuestionGroup" && (
        <Fragment>
          <QuestionGroup parentFormElementUUID={props.formElementData.uuid} {...props} />
          <Grid container direction="row" spacing={2}>
            <Grid>
              <AvniFormControl toolTipKey={"APP_DESIGNER_FORM_ELEMENT_REPEATABLE"}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="repeatable"
                      checked={!!props.formElementData.keyValues.repeatable}
                      onChange={event =>
                        props.handleGroupElementKeyValueChange(props.groupIndex, "repeatable", event.target.checked, props.index)
                      }
                    />
                  }
                  label="Repeatable"
                />
              </AvniFormControl>
            </Grid>
            <Grid>
              <AvniFormControl toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DISABLE_MANUAL_ACTIONS"}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="disableManualActions"
                      checked={!!props.formElementData.keyValues.disableManualActions}
                      onChange={event =>
                        props.handleGroupElementKeyValueChange(props.groupIndex, "disableManualActions", event.target.checked, props.index)
                      }
                    />
                  }
                  label="Disable manual addition and removal"
                />
              </AvniFormControl>
            </Grid>
            <Grid>
              <ColourStyle
                label={"Text colour"}
                colour={props.formElementData.keyValues.textColour}
                onChange={colour => props.handleGroupElementKeyValueChange(props.groupIndex, "textColour", colour, props.index)}
                toolTipKey={"APP_DESIGNER_GROUP_TEXT_COLOUR"}
              />
            </Grid>
            <Grid>
              <ColourStyle
                label={"Background colour"}
                colour={props.formElementData.keyValues.backgroundColour}
                onChange={colour => props.handleGroupElementKeyValueChange(props.groupIndex, "backgroundColour", colour, props.index)}
                toolTipKey={"APP_DESIGNER_GROUP_BACKGROUND_COLOUR"}
              />
            </Grid>
            <Grid>
              {props.formElementData.errorMessage?.disallowedChangeError && (
                <StyledErrorText sx={{ fontSize: "smaller" }}>
                  Changing repeatability is not allowed. Please replace this question with a new one, associate it with a different concept
                  and set the required repeatability.
                  <br />
                  If this change is absolutely required, please contact support team.
                </StyledErrorText>
              )}
            </Grid>
          </Grid>
        </Fragment>
      )}
    </Fragment>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default memo(connect(mapStateToProps)(FormElementDetails), areEqual);
