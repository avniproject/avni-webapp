import { styled } from "@mui/material/styles";
import {
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  FormHelperText
} from "@mui/material";
import { Delete, ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import PropTypes from "prop-types";
import { get, size } from "lodash";
import { AvniImageUpload } from "../../common/components/AvniImageUpload";
import { WebConceptView } from "common/model/WebConcept";

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  height: "35px",
  width: "10%",
  marginTop: 20
}));

const StyledGridContainer = styled(Grid)({
  marginTop: 20
});

const StyledFormControlLabel = styled(FormControlLabel)({
  marginTop: 15,
  marginLeft: 2
});

const StyledDeleteButton = styled(Button)({
  color: "#ff0000"
});

const StyledGrid = styled(Grid)({
  alignItems: "center"
});

export const CodedConceptAnswer = ({
  answer,
  index,
  inlineConcept,
  elementIndex,
  groupIndex,
  onChangeAnswerName,
  onToggleAnswerField,
  onSelectAnswerMedia,
  onRemoveAnswerMedia,
  totalAnswers,
  ...props
}) => {
  const action = actionName => {
    inlineConcept
      ? props[actionName](groupIndex, elementIndex, index)
      : props[actionName](index);
  };

  const isDuplicateAnswerValue =
    get(answer, "isAnswerHavingError.isErrored") &&
    answer.isAnswerHavingError.type === "duplicate";

  return (
    <StyledGrid container spacing={0}>
      <Grid
        size={{
          xs: 8,
          sm: 3,
          md: 4
        }}
      >
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
      <Grid>
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
            />
          }
          label="abnormal"
        />
      </Grid>
      <Grid>
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
            />
          }
          label="unique"
        />
      </Grid>
      <Grid>
        <StyledGrid container direction="row">
          <Grid>
            <StyledButton
              disabled={index === 0}
              color="primary"
              type="button"
              onClick={() => action("onMoveUp")}
            >
              <ArrowDropUp /> Move up
            </StyledButton>
          </Grid>
          <Grid>
            <StyledButton
              disabled={index + 1 === totalAnswers}
              color="primary"
              type="button"
              onClick={() => action("onMoveDown")}
            >
              <ArrowDropDown /> Move down
            </StyledButton>
          </Grid>
          <Grid>
            <StyledDeleteButton
              type="button"
              onClick={() => action("onDeleteAnswer")}
            >
              <Delete fontSize="small" /> Remove
            </StyledDeleteButton>
          </Grid>
          {!inlineConcept && (
            <Grid>
              <AvniImageUpload
                width={20}
                height={20}
                allowUpload={true}
                onSelect={mediaFile => onSelectAnswerMedia(mediaFile, index)}
                maxFileSize={WebConceptView.MaxFileSize}
                onDelete={() => onRemoveAnswerMedia(index)}
                oldImgUrl={answer.mediaUrl}
                uniqueName={"answer" + index}
              />
            </Grid>
          )}
        </StyledGrid>
      </Grid>
    </StyledGrid>
  );
};

CodedConceptAnswer.defaultProps = {
  inlineConcept: false,
  elementIndex: -1,
  groupIndex: -1
};

export default function CodedConcept(props) {
  return (
    <StyledGridContainer>
      <StyledButton
        type="button"
        color="primary"
        onClick={props.onAlphabeticalSort}
      >
        Sort alphabetically
      </StyledButton>
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
      <StyledButton type="button" color="primary" onClick={props.onAddAnswer}>
        Add New Answer
      </StyledButton>
    </StyledGridContainer>
  );
}

CodedConcept.propTypes = {
  answers: PropTypes.array.isRequired,
  onDeleteAnswer: PropTypes.func.isRequired,
  onAddAnswer: PropTypes.func.isRequired,
  onChangeAnswerName: PropTypes.func.isRequired,
  onToggleAnswerField: PropTypes.func.isRequired
};
