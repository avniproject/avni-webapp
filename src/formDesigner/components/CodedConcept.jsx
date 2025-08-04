import { styled } from "@mui/material/styles";
import {
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  FormHelperText,
  Box
} from "@mui/material";
import { Delete, ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import PropTypes from "prop-types";
import { get, size } from "lodash";
import { AvniImageUpload } from "../../common/components/AvniImageUpload";
import { WebConceptView } from "common/model/WebConcept";

const StyledButton = styled(Button)({
  height: "35px",
  width: "17%",
  justifyContent: "start",
  marginTop: 5
});

const StyledFormControlLabel = styled(FormControlLabel)({
  marginTop: 15,
  marginLeft: 2
});

const StyledDeleteButton = styled(Button)({
  color: "#ff0000"
});

export const CodedConceptAnswer = ({
  answer,
  index,
  inlineConcept = false,
  elementIndex = -1,
  groupIndex = -1,
  onChangeAnswerName,
  onToggleAnswerField,
  onSelectAnswerMedia,
  onRemoveAnswerMedia,
  totalAnswers,
  onToggleAnswerFielUUID,
  onToggleAnswerFieldUnique,
  onMoveUp,
  onMoveDown,
  onDeleteAnswer
}) => {
  const actionMap = {
    onToggleAnswerFielUUID,
    onToggleAnswerFieldUnique,
    onMoveUp,
    onMoveDown,
    onDeleteAnswer
  };

  const action = actionName => {
    const actionFn = actionMap[actionName];
    if (actionFn) {
      inlineConcept
        ? actionFn(groupIndex, elementIndex, index)
        : actionFn(index);
    }
  };

  const isDuplicateAnswerValue =
    get(answer, "isAnswerHavingError.isErrored") &&
    answer.isAnswerHavingError.type === "duplicate";

  return (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
      {/* Answer Input Field */}
      <Grid item xs={12} sm={8} md={6}>
        <AutoSuggestSingleSelection
          visibility={!answer.editable}
          showAnswer={answer}
          onChangeAnswerName={onChangeAnswerName}
          index={index}
          showSuggestionStartsWith={true}
          placeholder="Enter answer"
          label="Answer"
          inlineConcept={inlineConcept}
          elementIndex={elementIndex}
          groupIndex={groupIndex}
        />
        {get(answer, "isAnswerHavingError.isErrored") &&
          answer.isAnswerHavingError.type === "required" && (
            <FormHelperText error>Answer is required.</FormHelperText>
          )}
        {isDuplicateAnswerValue && (
          <FormHelperText error>Duplicate answer specified</FormHelperText>
        )}
      </Grid>

      {/* Checkboxes - Horizontal */}
      <Grid item xs={6} sm={4} md={2}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <StyledFormControlLabel
              control={
                <Checkbox
                  checked={answer.abnormal}
                  onChange={e =>
                    inlineConcept
                      ? onToggleAnswerField(
                          "abnormal",
                          groupIndex,
                          elementIndex,
                          index
                        )
                      : onToggleAnswerField(e, index)
                  }
                  value={answer.abnormal}
                  color="primary"
                  id="abnormal"
                  size="small"
                />
              }
              label="abnormal"
            />
          </Grid>
          <Grid item>
            <StyledFormControlLabel
              control={
                <Checkbox
                  checked={answer.unique}
                  onChange={e =>
                    inlineConcept
                      ? onToggleAnswerField(
                          "unique",
                          groupIndex,
                          elementIndex,
                          index
                        )
                      : onToggleAnswerField(e, index)
                  }
                  value={answer.unique}
                  color="primary"
                  id="unique"
                  size="small"
                />
              }
              label="unique"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Action Buttons - Horizontal */}
      <Grid item xs={6} sm={4} md={4}>
        <Grid container spacing={0.5} alignItems="center">
          <Grid item>
            <StyledButton
              disabled={index === 0}
              color="primary"
              type="button"
              onClick={() => action("onMoveUp")}
              size="small"
            >
              <ArrowDropUp /> Move up
            </StyledButton>
          </Grid>
          <Grid item>
            <StyledButton
              disabled={index + 1 === totalAnswers}
              color="primary"
              type="button"
              onClick={() => action("onMoveDown")}
              size="small"
            >
              <ArrowDropDown /> Move down
            </StyledButton>
          </Grid>
          <Grid item>
            <StyledDeleteButton
              type="button"
              onClick={() => action("onDeleteAnswer")}
              size="small"
            >
              <Delete fontSize="small" /> Remove
            </StyledDeleteButton>
          </Grid>
          {!inlineConcept && (
            <Grid item>
              <AvniImageUpload
                width={20}
                height={20}
                allowUpload={true}
                onSelect={mediaFile => onSelectAnswerMedia(mediaFile, index)}
                maxFileSize={WebConceptView.MaxFileSize}
                onDelete={() => onRemoveAnswerMedia(index)}
                oldImgUrl={answer.mediaUrl}
                uniqueName={"answer" + index}
                localMediaUrl={
                  answer.unSavedMediaFile &&
                  URL.createObjectURL(answer.unSavedMediaFile)
                }
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default function CodedConcept(props) {
  return (
    <Box sx={{ mt: 2 }}>
      {/* Sort Button - Separate from answers */}
      <Box sx={{ mb: 2 }}>
        <StyledButton
          type="button"
          color="primary"
          onClick={props.onAlphabeticalSort}
          size="medium"
        >
          Sort alphabetically
        </StyledButton>
      </Box>

      {/* Answers List */}
      <Box sx={{ mb: 2 }}>
        {props.answers.map((answer, index) => {
          return (
            !answer.voided && (
              <CodedConceptAnswer
                key={`answer-${index}`}
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
            )
          );
        })}
      </Box>

      {/* Add New Answer Button */}
      <Box>
        <StyledButton
          type="button"
          color="primary"
          onClick={props.onAddAnswer}
          // variant="contained"
          size="medium"
        >
          Add New Answer
        </StyledButton>
      </Box>
    </Box>
  );
}

CodedConcept.propTypes = {
  answers: PropTypes.array.isRequired,
  onDeleteAnswer: PropTypes.func.isRequired,
  onAddAnswer: PropTypes.func.isRequired,
  onChangeAnswerName: PropTypes.func.isRequired,
  onToggleAnswerField: PropTypes.func.isRequired
};
