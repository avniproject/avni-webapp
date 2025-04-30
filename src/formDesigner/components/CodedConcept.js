import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import PropTypes from "prop-types";
import FormHelperText from "@material-ui/core/FormHelperText";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { get, size } from "lodash";
import { AvniImageUpload } from "../../common/components/AvniImageUpload";
import { WebConceptView } from "common/model/WebConcept";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
    height: "35px",
    width: "10%",
    marginTop: 20
  }
}));

export const CodedConceptAnswer = props => {
  const action = actionName => {
    props.inlineConcept ? props[actionName](props.groupIndex, props.elementIndex, props.index) : props[actionName](props.index);
  };

  const isDuplicateAnswerValue =
    get(props.answer, "isAnswerHavingError.isErrored") && props.answer.isAnswerHavingError.type === "duplicate";

  return (
    <Grid item container spacing={0} alignItems={"center"}>
      <Grid item xs={8} sm={3} md={4}>
        <AutoSuggestSingleSelection
          visibility={!props.answer.editable}
          showAnswer={props.answer}
          onChangeAnswerName={props.onChangeAnswerName}
          index={props.index}
          showSuggestionStartsWith={true}
          placeholder="Enter answer"
          label="Answer"
          inlineConcept={props.inlineConcept}
          elementIndex={props.elementIndex}
          groupIndex={props.groupIndex}
        />
        {get(props.answer, "isAnswerHavingError.isErrored") && props.answer.isAnswerHavingError.type === "required" && (
          <FormHelperText error>Answer is required.</FormHelperText>
        )}
        {isDuplicateAnswerValue && <FormHelperText error>Duplicate answer specified</FormHelperText>}
      </Grid>
      <Grid item>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.answer.abnormal}
              onChange={e =>
                props.inlineConcept
                  ? props.onToggleAnswerField("abnormal", props.groupIndex, props.elementIndex, props.index)
                  : props.onToggleAnswerField(e, props.index)
              }
              value={props.answer.abnormal}
              color="primary"
              id="abnormal"
            />
          }
          label="abnormal"
          style={{ marginTop: 15, marginLeft: 2 }}
        />
      </Grid>
      <Grid item>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.answer.unique}
              onChange={e =>
                props.inlineConcept
                  ? props.onToggleAnswerField("unique", props.groupIndex, props.elementIndex, props.index)
                  : props.onToggleAnswerField(e, props.index)
              }
              value={props.answer.unique}
              color="primary"
              id="unique"
            />
          }
          label="unique"
          style={{ marginTop: 15 }}
        />
      </Grid>
      <Grid item>
        <Grid item container direction={"row"} alignItems={"center"}>
          <Grid item>
            <Button disabled={props.index === 0} color="primary" type="button" onClick={() => action("onMoveUp")}>
              <ArrowDropUpIcon /> Move up
            </Button>
          </Grid>
          <Grid item>
            <Button disabled={props.index + 1 === props.totalAnswers} color="primary" type="button" onClick={() => action("onMoveDown")}>
              <ArrowDropDownIcon /> Move down
            </Button>
          </Grid>
          <Grid item>
            <Button style={{ color: "#ff0000" }} type="button" onClick={() => action("onDeleteAnswer")}>
              <DeleteIcon fontSize={"small"} /> Remove
            </Button>
          </Grid>
          <Grid item>
            <AvniImageUpload
              width={20}
              height={20}
              allowUpload={true}
              onSelect={mediaFile => props.onSelectAnswerMedia(mediaFile, props.index)}
              maxFileSize={WebConceptView.MaxFileSize}
              onDelete={() => props.onRemoveAnswerMedia(props.index)}
              oldImgUrl={props.answer.mediaUrl}
              uniqueName={"answer" + props.index}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

CodedConceptAnswer.defaultProps = {
  inlineConcept: false,
  elementIndex: -1,
  groupIndex: -1
};

export default function CodedConcept(props) {
  return (
    <>
      <Grid container style={{ marginTop: 20 }}>
        <Button type="button" className={useStyles.button} color="primary" onClick={props.onAlphabeticalSort}>
          Sort alphabetically
        </Button>
        {props.answers.map((answer, index) => {
          return (
            !answer.voided && (
              <Grid container key={`answer-${index}`}>
                <CodedConceptAnswer
                  answer={answer}
                  index={index}
                  onDeleteAnswer={props.onDeleteAnswer}
                  onAddAnswer={props.onAddAnswer}
                  onChangeAnswerName={props.onChangeAnswerName}
                  onToggleAnswerField={props.onToggleAnswerField}
                  onMoveUp={props.onMoveUp}
                  onMoveDown={props.onMoveDown}
                  totalAnswers={size(props.answers)}
                  onSelectAnswerMedia={props.onSelectAnswerMedia}
                  onRemoveAnswerMedia={props.onRemoveAnswerMedia}
                />
              </Grid>
            )
          );
        })}
      </Grid>

      <Button type="button" className={useStyles.button} color="primary" onClick={props.onAddAnswer}>
        Add New Answer
      </Button>
    </>
  );
}

CodedConcept.propTypes = {
  answers: PropTypes.array.isRequired,
  onDeleteAnswer: PropTypes.func.isRequired,
  onAddAnswer: PropTypes.func.isRequired,
  onChangeAnswerName: PropTypes.func.isRequired,
  onToggleAnswerField: PropTypes.func.isRequired
};
