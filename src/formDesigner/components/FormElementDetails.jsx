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
  Chip,
  Stack
} from "@mui/material";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import InlineConcept from "./InlineConcept";
import _, { capitalize, get, includes, isNil, replace, toNumber } from "lodash";
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
import { useSelector } from "react-redux";
import UserInfo from "../../common/model/UserInfo";

const StyledFormControl = styled(MuiFormControl)({
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

const StyledLink = styled("a")(({ theme }) => ({
  color: theme.palette.primary.main
}));

const StyledChipContainer = styled("div")({
  paddingTop: 10
});

const showPicker = (pickerType, props, disableFormElement) => {
  const picker = pickers.find(picker => picker.type === pickerType);
  const pickerModes = picker.modes.map(mode => (
    <FormControlLabel
      key={mode.id}
      value={mode.id}
      control={<Radio />}
      label={mode.name}
      disabled={disableFormElement}
    />
  ));

  return (
    <Grid container sm={12}>
      <AvniFormLabel
        label={picker.label}
        toolTipKey={picker.toolTipKey}
        sx={{ mt: 1.5, mr: 1, color: "black" }}
      />
      <RadioGroup
        aria-label={picker.label}
        name={picker.key}
        value={props.formElementData.keyValues[picker.key]}
        onChange={event =>
          props.handleGroupElementKeyValueChange(
            props.groupIndex,
            picker.key,
            event.target.value,
            props.index
          )
        }
        row
      >
        {pickerModes}
      </RadioGroup>
    </Grid>
  );
};

export const BackButton = ({
  style,
  handleConceptFormLibrary,
  groupIndex,
  elementIndex
}) => {
  return (
    <Button
      size="small"
      variant="outlined"
      sx={style}
      onClick={() =>
        handleConceptFormLibrary(groupIndex, "", elementIndex, true)
      }
    >
      Cancel
    </Button>
  );
};

export const multiSelectFormElementConceptDataTypes = [
  "Coded",
  "Subject",
  "Image",
  "ImageV2",
  "Video",
  "File",
  "Encounter"
];

const FormElementDetails = ({
  disableFormElement,
  identifierSources,
  groupSubjectTypes,
  formElementData,
  groupIndex,
  index,
  ignoreDataTypes,
  ...rest
}) => {
  const { t } = useTranslation();
  const userInfo = useSelector(state => state.app.userInfo);
  const dataTypesToIgnore = ignoreDataTypes || [];

  const onChangeAnswerName = (answerName, idx, flag = true) => {
    if (flag) {
      rest.handleGroupElementChange(groupIndex, "concept", answerName, index);
      if (formElementData.name === "") {
        rest.handleGroupElementChange(
          groupIndex,
          "name",
          answerName.name,
          index
        );
      }
    } else {
      rest.updateConceptElementData(groupIndex, "name", answerName, index);
    }
  };

  const identifierSourceList = () =>
    identifierSources.map(idSource => (
      <MenuItem key={idSource.value} value={idSource.value}>
        {idSource.label}
      </MenuItem>
    ));

  const groupSubjectTypeList = () =>
    groupSubjectTypes.map(({ name, uuid }) => (
      <MenuItem key={uuid} value={uuid}>
        {name}
      </MenuItem>
    ));

  const groupRoleList = () => {
    const selectedGroupSubjectType = groupSubjectTypes.find(
      ({ uuid }) => uuid === formElementData.keyValues.groupSubjectTypeUUID
    );
    return (selectedGroupSubjectType?.groupRoles || []).map(
      ({ role, uuid }) => (
        <MenuItem key={uuid} value={uuid}>
          {role}
        </MenuItem>
      )
    );
  };

  const renderDurationOptions = () => {
    const durations = ["years", "months", "weeks", "days", "hours", "minutes"];
    return durations.map(duration => (
      <FormControlLabel
        key={duration}
        control={
          <Checkbox
            checked={
              formElementData.keyValues.durationOptions?.includes(duration) ||
              false
            }
            value={duration}
            onChange={event =>
              rest.handleGroupElementKeyValueChange(
                groupIndex,
                duration,
                event.target.value,
                index
              )
            }
          />
        }
        label={capitalize(duration)}
      />
    ));
  };

  return (
    <Fragment>
      <Grid container sm={12}>
        {formElementData.errorMessage?.name && (
          <StyledErrorText>Please enter name</StyledErrorText>
        )}
        {formElementData.errorMessage?.ruleError && (
          <StyledErrorText>
            Please check the rule validation errors
          </StyledErrorText>
        )}
        <StyledFormControl>
          <AvniFormLabel
            label={t("Question")}
            toolTipKey={"APP_DESIGNER_FORM_ELEMENT_NAME"}
          />
          <Input
            id="elementNameDetails"
            value={formElementData.name}
            onChange={event =>
              rest.handleGroupElementChange(
                groupIndex,
                "name",
                replace(event.target.value, "|", ""),
                index
              )
            }
            disabled={disableFormElement}
          />
        </StyledFormControl>
        <StyledPaper>
          <StyledHeader>
            <StyledHeaderText>CONCEPT</StyledHeaderText>
          </StyledHeader>
          {formElementData.showConceptLibrary === "" && (
            <StyledContainer>
              <Button
                color="primary"
                type="button"
                onClick={() =>
                  rest.handleConceptFormLibrary(
                    groupIndex,
                    "chooseFromLibrary",
                    index
                  )
                }
                disabled={disableFormElement}
              >
                Select from library
              </Button>
              <br />
              OR
              <br />
              {UserInfo.hasPrivilege(
                userInfo,
                Privilege.PrivilegeType.EditConcept
              ) && (
                <Button
                  color="primary"
                  type="button"
                  onClick={() =>
                    rest.handleConceptFormLibrary(
                      groupIndex,
                      "addNewConcept",
                      index
                    )
                  }
                  disabled={disableFormElement}
                >
                  Create new
                </Button>
              )}
            </StyledContainer>
          )}
          {formElementData.showConceptLibrary === "addNewConcept" && (
            <StyledContainer>
              <InlineConcept
                onSaveInlineConcept={rest.onSaveInlineConcept}
                formElementData={formElementData}
                index={index}
                groupIndex={groupIndex}
                handleGroupElementChange={rest.handleGroupElementChange}
                handleInlineNumericAttributes={
                  rest.handleInlineNumericAttributes
                }
                handleInlineCodedConceptAnswers={
                  rest.handleInlineCodedConceptAnswers
                }
                onToggleInlineConceptCodedAnswerAttribute={
                  rest.onToggleInlineConceptCodedAnswerAttribute
                }
                onDeleteInlineConceptCodedAnswerDelete={
                  rest.onDeleteInlineConceptCodedAnswerDelete
                }
                onMoveUp={rest.onMoveUp}
                onMoveDown={rest.onMoveDown}
                onAlphabeticalSort={rest.onAlphabeticalSort}
                handleInlineCodedAnswerAddition={
                  rest.handleInlineCodedAnswerAddition
                }
                handleInlineLocationAttributes={
                  rest.handleInlineLocationAttributes
                }
                handleInlineSubjectAttributes={
                  rest.handleInlineSubjectAttributes
                }
                handleInlineEncounterAttributes={
                  rest.handleInlineEncounterAttributes
                }
                handleInlinePhoneNumberAttributes={
                  rest.handleInlinePhoneNumberAttributes
                }
                handleConceptFormLibrary={rest.handleConceptFormLibrary}
                dataTypesToIgnore={dataTypesToIgnore}
                onSelectAnswerMedia={rest.onSelectAnswerMedia}
              />
            </StyledContainer>
          )}
          {formElementData.showConceptLibrary === "chooseFromLibrary" && (
            <StyledContainer>
              <Grid sm={12}>
                {formElementData.errorMessage?.concept && (
                  <StyledErrorText>Please enter concept</StyledErrorText>
                )}
                <StyledFormControl>
                  {formElementData.newFlag ? (
                    <AutoSuggestSingleSelection
                      visibility={!formElementData.newFlag}
                      showAnswer={formElementData.concept}
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
                        formElementData.concept.name
                      ) : (
                        <StyledLink
                          href={`#/appDesigner/concept/${
                            formElementData.concept.uuid
                          }/show`}
                        >
                          {formElementData.concept.name}
                        </StyledLink>
                      )}
                    </>
                  )}
                </StyledFormControl>
              </Grid>
              {formElementData.concept.dataType !== "Coded" && <Grid sm={6} />}
              {formElementData.concept.dataType === "Numeric" && (
                <Grid container sm={12}>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel
                        label={"Low Absolute"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_LOW_ABSOLUTE"}
                      />
                      <Input
                        disableUnderline
                        value={
                          isNil(formElementData.concept.lowAbsolute)
                            ? "N.A"
                            : formElementData.concept.lowAbsolute
                        }
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel
                        label={"High Absolute"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_HIGH_ABSOLUTE"}
                      />
                      <Input
                        disableUnderline
                        value={
                          isNil(formElementData.concept.highAbsolute)
                            ? "N.A"
                            : formElementData.concept.highAbsolute
                        }
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel
                        label={"Low normal"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_LOW_NORMAL"}
                      />
                      <Input
                        disableUnderline
                        value={
                          isNil(formElementData.concept.lowNormal)
                            ? "N.A"
                            : formElementData.concept.lowNormal
                        }
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel
                        label={"High normal"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_HIGH_NORMAL"}
                      />
                      <Input
                        disableUnderline
                        value={
                          isNil(formElementData.concept.highNormal)
                            ? "N.A"
                            : formElementData.concept.highNormal
                        }
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                  <Grid sm={2}>
                    <StyledFormControl>
                      <AvniFormLabel
                        label={"Unit"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_UNIT"}
                      />
                      <Input
                        disableUnderline
                        value={
                          isNil(formElementData.concept.unit)
                            ? "N.A"
                            : formElementData.concept.unit
                        }
                        disabled
                      />
                    </StyledFormControl>
                  </Grid>
                </Grid>
              )}
              {formElementData.concept.dataType === "Coded" && (
                <Grid container sm={12}>
                  <StyledChipContainer>
                    <InputLabel>Answers:</InputLabel>
                    {_.orderBy(formElementData.concept.answers, "order").map(
                      d =>
                        !d.excluded && !d.voided ? (
                          <Chip
                            key={d.name}
                            label={
                              disableFormElement ? (
                                d.name
                              ) : (
                                <StyledLink
                                  href={`#/appDesigner/concept/${d.uuid}/show`}
                                >
                                  <span>{d.name}</span>
                                </StyledLink>
                              )
                            }
                            onDelete={() =>
                              disableFormElement
                                ? _.noop()
                                : rest.handleExcludedAnswers(
                                    d.name,
                                    true,
                                    groupIndex,
                                    index
                                  )
                            }
                          />
                        ) : null
                    )}
                  </StyledChipContainer>
                </Grid>
              )}
              {formElementData.newFlag && (
                <BackButton
                  handleConceptFormLibrary={rest.handleConceptFormLibrary}
                  groupIndex={groupIndex}
                  elementIndex={index}
                />
              )}
            </StyledContainer>
          )}
        </StyledPaper>
        {includes(
          multiSelectFormElementConceptDataTypes,
          formElementData.concept.dataType
        ) && (
          <Grid sm={6}>
            {formElementData.errorMessage?.type && (
              <StyledErrorText>Please select type</StyledErrorText>
            )}
            <StyledFormControl disabled={disableFormElement}>
              <AvniFormLabel
                label={"Type"}
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_CODED_TYPE"}
              />
              <Select
                name="type"
                value={formElementData.type}
                onChange={event =>
                  rest.handleGroupElementChange(
                    groupIndex,
                    "type",
                    event.target.value,
                    index
                  )
                }
                required
              >
                <MenuItem value="SingleSelect">SingleSelect</MenuItem>
                <MenuItem value="MultiSelect">MultiSelect</MenuItem>
              </Select>
            </StyledFormControl>
            {formElementData.errorMessage?.disallowedChangeError && (
              <StyledErrorText sx={{ fontSize: "smaller" }}>
                Changing type is not allowed. Please replace this question with
                a new one, associate it with a different concept and set the
                required type.
                <br />
                If this change is absolutely required, please contact support
                team.
              </StyledErrorText>
            )}
          </Grid>
        )}
        <StyledFormControl>
          <AvniFormLabel
            label={t("Documentation")}
            toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DOCUMENTATION"}
          />
          <DocumentationSearch
            value={formElementData.documentation}
            onChange={documentation =>
              rest.handleGroupElementChange(
                groupIndex,
                "documentation",
                documentation,
                index
              )
            }
          />
        </StyledFormControl>
        {formElementData.concept.dataType === "Coded" && (
          <Grid container sm={12}>
            <StyledChipContainer>
              <InputLabel>Excluded Answers:</InputLabel>
              {formElementData.concept.answers.map(d =>
                d.excluded && !d.voided ? (
                  <Chip
                    key={d.name}
                    label={
                      disableFormElement ? (
                        d.name
                      ) : (
                        <StyledLink
                          href={`#/appDesigner/concept/${d.uuid}/show`}
                        >
                          <span>{d.name}</span>
                        </StyledLink>
                      )
                    }
                    onDelete={() =>
                      disableFormElement
                        ? _.noop()
                        : rest.handleExcludedAnswers(
                            d.name,
                            false,
                            groupIndex,
                            index
                          )
                    }
                  />
                ) : null
              )}
            </StyledChipContainer>
          </Grid>
        )}
        {formElementData.concept.dataType === "Video" && (
          <Grid container sm={12}>
            <Grid sm={4}>
              <TextField
                type="number"
                name="durationLimitInSecs"
                label="Duration limit(seconds)"
                placeholder="60"
                value={formElementData.keyValues.durationLimitInSecs}
                onChange={event =>
                  rest.handleGroupElementKeyValueChange(
                    groupIndex,
                    "durationLimitInSecs",
                    event.target.value,
                    index
                  )
                }
                margin="normal"
                inputProps={{ min: 0 }}
                disabled={disableFormElement}
              />
              {formElementData.errorMessage?.durationLimitInSecs && (
                <StyledErrorText>Please enter positive number</StyledErrorText>
              )}
            </Grid>
            <Grid sm={1} />
            <Grid sm={3}>
              <StyledFormControlNarrow disabled={disableFormElement}>
                <AvniFormLabel
                  label={"Video Quality"}
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_VIDEO_QUALITY"}
                />
                <Select
                  name="videoQuality"
                  value={formElementData.keyValues.videoQuality ?? "high"}
                  onChange={event =>
                    rest.handleGroupElementKeyValueChange(
                      groupIndex,
                      "videoQuality",
                      event.target.value,
                      index
                    )
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </StyledFormControlNarrow>
            </Grid>
          </Grid>
        )}
        {formElementData.concept.dataType === "File" && (
          <FileOptions
            keyValues={formElementData.keyValues}
            handleChange={rest.handleGroupElementKeyValueChange}
            groupIndex={groupIndex}
            index={index}
          />
        )}
        {(formElementData.concept.dataType === "Image" ||
          formElementData.concept.dataType === "ImageV2") && (
          <Grid container sm={12}>
            <Grid sm={3}>
              <TextField
                name="maxHeight"
                type="number"
                label="Max Height"
                placeholder="960"
                value={formElementData.keyValues.maxHeight}
                onChange={event =>
                  rest.handleGroupElementKeyValueChange(
                    groupIndex,
                    "maxHeight",
                    toNumber(event.target.value),
                    index
                  )
                }
                margin="normal"
                inputProps={{ min: 0 }}
                disabled={disableFormElement}
              />
              {formElementData.errorMessage?.maxHeight && (
                <StyledErrorText>Please enter positive number</StyledErrorText>
              )}
            </Grid>
            <Grid sm={1} />
            <Grid sm={3}>
              <TextField
                type="number"
                name="maxWidth"
                label="Max Width"
                placeholder="1280"
                value={formElementData.keyValues.maxWidth}
                onChange={event =>
                  rest.handleGroupElementKeyValueChange(
                    groupIndex,
                    "maxWidth",
                    toNumber(event.target.value),
                    index
                  )
                }
                margin="normal"
                inputProps={{ min: 0 }}
                disabled={disableFormElement}
              />
              {formElementData.errorMessage?.maxWidth && (
                <StyledErrorText>Please enter positive number</StyledErrorText>
              )}
            </Grid>
            <Grid sm={1} />
            <Grid sm={3}>
              <StyledFormControlNarrow disabled={disableFormElement}>
                <AvniFormLabel
                  label={"Image Quality"}
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_IMAGE_QUALITY"}
                />
                <Select
                  name="imageQuality"
                  value={formElementData.keyValues.imageQuality ?? 1}
                  onChange={event =>
                    rest.handleGroupElementKeyValueChange(
                      groupIndex,
                      "imageQuality",
                      toNumber(event.target.value),
                      index
                    )
                  }
                >
                  <MenuItem value="0.5">Low</MenuItem>
                  <MenuItem value="1">High</MenuItem>
                </Select>
              </StyledFormControlNarrow>
            </Grid>
          </Grid>
        )}
        {formElementData.concept.dataType === "Date" &&
          showPicker(
            "date",
            {
              formElementData,
              handleGroupElementKeyValueChange:
                rest.handleGroupElementKeyValueChange,
              groupIndex,
              index
            },
            disableFormElement
          )}
        {formElementData.errorMessage?.durationOptions && (
          <StyledErrorText sx={{ fontSize: "13px" }}>
            Duration options must be selected.
          </StyledErrorText>
        )}
        {["Date", "Duration"].includes(formElementData.concept.dataType) && (
          <Grid container sm={12}>
            <AvniFormLabel
              label={"Duration Options"}
              toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DURATION_OPTIONS"}
              sx={{ mt: 1.5, mr: 1, color: "black" }}
            />
            <StyledFormControl
              component="fieldset"
              disabled={disableFormElement}
            >
              <FormGroup row>{renderDurationOptions()}</FormGroup>
            </StyledFormControl>
          </Grid>
        )}
        {formElementData.concept.dataType === "DateTime" &&
          showPicker(
            "date",
            {
              formElementData,
              handleGroupElementKeyValueChange:
                rest.handleGroupElementKeyValueChange,
              groupIndex,
              index
            },
            disableFormElement
          )}
        {formElementData.concept.dataType === "Time" &&
          showPicker(
            "time",
            {
              formElementData,
              handleGroupElementKeyValueChange:
                rest.handleGroupElementKeyValueChange,
              groupIndex,
              index
            },
            disableFormElement
          )}
        <Stack spacing={4} alignItems="center" flexWrap="wrap">
          {["Text"].includes(formElementData.concept.dataType) && (
            <Grid sm={12}>
              {formElementData.errorMessage?.validFormat && (
                <StyledErrorText>
                  Validation Regex and description key both must be empty or
                  both must be filled
                </StyledErrorText>
              )}
              <StyledFormControl disabled={disableFormElement}>
                <AvniFormLabel
                  label={"Validation Regex"}
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_VALIDATION_REGEX"}
                />
                <Input
                  id="validFormatRegex"
                  value={get(formElementData, "validFormat.regex", "")}
                  onChange={event =>
                    rest.handleGroupElementKeyValueChange(
                      groupIndex,
                      "regex",
                      event.target.value,
                      index
                    )
                  }
                />
              </StyledFormControl>
              <StyledFormControl disabled={disableFormElement}>
                <AvniFormLabel
                  label={"Validation Description Key"}
                  toolTipKey={
                    "APP_DESIGNER_FORM_ELEMENT_VALIDATION_DESCRIPTION_KEY"
                  }
                />
                <Input
                  id="validFormatDescriptionKey"
                  value={get(formElementData, "validFormat.descriptionKey", "")}
                  onChange={event =>
                    rest.handleGroupElementKeyValueChange(
                      groupIndex,
                      "descriptionKey",
                      event.target.value,
                      index
                    )
                  }
                />
              </StyledFormControl>
            </Grid>
          )}
          <Grid container sm={12}>
            {formElementData.concept.dataType !== "QuestionGroup" && (
              <Grid sm={4}>
                <AvniFormControl
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_MANDATORY"}
                  disabled={disableFormElement}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="mandatoryDetails"
                        checked={!!formElementData.mandatory}
                        value={formElementData.mandatory ? "yes" : "no"}
                        onChange={event =>
                          rest.handleGroupElementChange(
                            groupIndex,
                            "mandatory",
                            event.target.value === "yes" ? false : true,
                            index
                          )
                        }
                      />
                    }
                    label="Mandatory"
                  />
                </AvniFormControl>
              </Grid>
            )}
            {formElementData.concept.dataType === "Subject" && (
              <SubjectFormElementKeyValues
                {...{
                  disableFormElement,
                  identifierSources,
                  groupSubjectTypes,
                  formElementData,
                  groupIndex,
                  index,
                  ...rest
                }}
              />
            )}
            <Grid sm={4}>
              {[
                "Numeric",
                "Text",
                "Date",
                "DateTime",
                "Time",
                "Coded"
              ].includes(formElementData.concept.dataType) && (
                <AvniFormControl
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_READ_ONLY"}
                  disabled={disableFormElement}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="editable"
                        checked={formElementData.keyValues.editable ?? false}
                        onChange={event =>
                          rest.handleGroupElementKeyValueChange(
                            groupIndex,
                            "editable",
                            !formElementData.keyValues.editable,
                            index
                          )
                        }
                      />
                    }
                    label="Read Only"
                  />
                </AvniFormControl>
              )}
            </Grid>
            {["Numeric", "Text", "PhoneNumber"].includes(
              formElementData.concept.dataType
            ) && (
              <Grid sm={4}>
                <AvniFormControl
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_UNIQUE"}
                  disabled={disableFormElement}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="unique"
                        checked={!!formElementData.keyValues.unique}
                        onChange={event =>
                          rest.handleGroupElementKeyValueChange(
                            groupIndex,
                            "unique",
                            event.target.checked,
                            index
                          )
                        }
                      />
                    }
                    label="Unique"
                  />
                </AvniFormControl>
              </Grid>
            )}
          </Grid>
        </Stack>
        {formElementData.concept.dataType === "Id" && (
          <Grid sm={6}>
            <StyledFormControl disabled={disableFormElement}>
              <AvniFormLabel
                label={"Identifier Source"}
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_IDENTIFIER_SOURCE"}
              />
              <Select
                name="identifierSource"
                value={formElementData.keyValues.IdSourceUUID}
                onChange={event =>
                  rest.handleGroupElementKeyValueChange(
                    groupIndex,
                    "IdSourceUUID",
                    event.target.value,
                    index
                  )
                }
                required
              >
                {identifierSourceList()}
              </Select>
            </StyledFormControl>
          </Grid>
        )}
        {formElementData.concept.dataType === "GroupAffiliation" && (
          <Grid container spacing={5}>
            <Grid sm={6}>
              <StyledFormControl disabled={disableFormElement}>
                <AvniFormLabel
                  label={"Group Subject Type"}
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_SUBJECT_TYPE"}
                />
                <Select
                  name="groupSubjectType"
                  value={formElementData.keyValues.groupSubjectTypeUUID}
                  onChange={event =>
                    rest.handleGroupElementKeyValueChange(
                      groupIndex,
                      "groupSubjectTypeUUID",
                      event.target.value,
                      index
                    )
                  }
                  required
                >
                  {groupSubjectTypeList()}
                </Select>
              </StyledFormControl>
            </Grid>
            <Grid sm={6}>
              {formElementData.keyValues.groupSubjectTypeUUID && (
                <StyledFormControl disabled={disableFormElement}>
                  <AvniFormLabel
                    label={"Group Role"}
                    toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_ROLE"}
                  />
                  <Select
                    name="groupSubjectRole"
                    value={formElementData.keyValues.groupSubjectRoleUUID}
                    onChange={event =>
                      rest.handleGroupElementKeyValueChange(
                        groupIndex,
                        "groupSubjectRoleUUID",
                        event.target.value,
                        index
                      )
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
      {formElementData.concept.dataType === "QuestionGroup" && (
        <Fragment>
          <QuestionGroup
            parentFormElementUUID={formElementData.uuid}
            {...{
              disableFormElement,
              identifierSources,
              groupSubjectTypes,
              formElementData,
              groupIndex,
              index,
              ...rest
            }}
          />
          <Grid container direction="row" spacing={2}>
            <Grid>
              <AvniFormControl
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_REPEATABLE"}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      id="repeatable"
                      checked={!!formElementData.keyValues.repeatable}
                      onChange={event =>
                        rest.handleGroupElementKeyValueChange(
                          groupIndex,
                          "repeatable",
                          event.target.checked,
                          index
                        )
                      }
                    />
                  }
                  label="Repeatable"
                />
              </AvniFormControl>
            </Grid>
            <Grid>
              <AvniFormControl
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DISABLE_MANUAL_ACTIONS"}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      id="disableManualActions"
                      checked={!!formElementData.keyValues.disableManualActions}
                      onChange={event =>
                        rest.handleGroupElementKeyValueChange(
                          groupIndex,
                          "disableManualActions",
                          event.target.checked,
                          index
                        )
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
                colour={formElementData.keyValues.textColour}
                onChange={colour =>
                  rest.handleGroupElementKeyValueChange(
                    groupIndex,
                    "textColour",
                    colour,
                    index
                  )
                }
                toolTipKey={"APP_DESIGNER_GROUP_TEXT_COLOUR"}
              />
            </Grid>
            <Grid>
              <ColourStyle
                label={"Background colour"}
                colour={formElementData.keyValues.backgroundColour}
                onChange={colour =>
                  rest.handleGroupElementKeyValueChange(
                    groupIndex,
                    "backgroundColour",
                    colour,
                    index
                  )
                }
                toolTipKey={"APP_DESIGNER_GROUP_BACKGROUND_COLOUR"}
              />
            </Grid>
            <Grid>
              {formElementData.errorMessage?.disallowedChangeError && (
                <StyledErrorText sx={{ fontSize: "smaller" }}>
                  Changing repeatability is not allowed. Please replace this
                  question with a new one, associate it with a different concept
                  and set the required repeatability.
                  <br />
                  If this change is absolutely required, please contact support
                  team.
                </StyledErrorText>
              )}
            </Grid>
          </Grid>
        </Fragment>
      )}
    </Fragment>
  );
};

export default memo(FormElementDetails);
