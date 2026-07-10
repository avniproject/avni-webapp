import { styled } from "@mui/material/styles";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  FormHelperText,
  Box,
  Pagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Delete,
  ArrowDropUp,
  ArrowDropDown,
  Search,
} from "@mui/icons-material";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import PropTypes from "prop-types";
import { get, isEmpty, size } from "lodash";
import { AvniMediaUpload } from "../../common/components/AvniMediaUpload";
import { WebConceptView } from "common/model/WebConcept";

const StyledButton = styled(Button)({
  height: "35px",
  width: "17%",
  justifyContent: "start",
  marginTop: 5,
});

const StyledFormControlLabel = styled(FormControlLabel)({
  marginTop: 15,
  marginLeft: 2,
});

const StyledDeleteButton = styled(Button)({
  color: "#ff0000",
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
  onDeleteAnswer,
}) => {
  const actionMap = {
    onToggleAnswerFielUUID,
    onToggleAnswerFieldUnique,
    onMoveUp,
    onMoveDown,
    onDeleteAnswer,
  };

  const action = (actionName) => {
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

  const currentImageUrl =
    !isEmpty(answer.media) &&
    !isEmpty(answer.media.filter((m) => m.type === "Image"))
      ? answer.media.filter((m) => m.type === "Image")[0].url
      : null;
  const currentVideoUrl =
    !isEmpty(answer.media) &&
    !isEmpty(answer.media.filter((m) => m.type === "Video"))
      ? answer.media.filter((m) => m.type === "Video")[0].url
      : null;
  return (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
      {/* Answer Input Field */}
      <Grid xs={12} sm={8} md={6}>
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
        {get(answer, "isAnswerHavingError.isErrored") &&
          answer.isAnswerHavingError.type === "nameConflict" && (
            <FormHelperText error>
              A concept with this name already exists. Please select it from the
              suggestion list.
            </FormHelperText>
          )}
      </Grid>

      {/* Checkboxes - Horizontal */}
      <Grid xs={6} sm={4} md={2}>
        <Grid container spacing={1} alignItems="center">
          <Grid>
            <StyledFormControlLabel
              control={
                <Checkbox
                  checked={answer.abnormal}
                  onChange={(e) =>
                    inlineConcept
                      ? onToggleAnswerField(
                          "abnormal",
                          groupIndex,
                          elementIndex,
                          index,
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
          <Grid>
            <StyledFormControlLabel
              control={
                <Checkbox
                  checked={answer.unique}
                  onChange={(e) =>
                    inlineConcept
                      ? onToggleAnswerField(
                          "unique",
                          groupIndex,
                          elementIndex,
                          index,
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
      <Grid xs={6} sm={4} md={4}>
        <Grid container spacing={0.5} alignItems="center">
          <Grid>
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
          <Grid>
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
          <Grid>
            <StyledDeleteButton
              type="button"
              onClick={() => action("onDeleteAnswer")}
              size="small"
            >
              <Delete fontSize="small" /> Remove
            </StyledDeleteButton>
          </Grid>
          {!inlineConcept && (
            <>
              <Grid item>
                <AvniMediaUpload
                  width={20}
                  height={20}
                  accept="image/*"
                  allowUpload={true}
                  onSelect={(mediaFile) =>
                    onSelectAnswerMedia(mediaFile, index, "Image")
                  }
                  maxFileSize={WebConceptView.MaxImageFileSize}
                  onDelete={() => onRemoveAnswerMedia(index, "Image")}
                  oldImgUrl={currentImageUrl}
                  uniqueName={"answer-image-" + answer.uuid}
                  localMediaUrl={
                    answer.unsavedImage &&
                    URL.createObjectURL(answer.unsavedImage)
                  }
                />
              </Grid>
              <Grid item>
                <AvniMediaUpload
                  width={20}
                  height={20}
                  accept="video/*"
                  mediaType={"Video"}
                  allowUpload={true}
                  onSelect={(mediaFile) =>
                    onSelectAnswerMedia(mediaFile, index, "Video")
                  }
                  maxFileSize={WebConceptView.MaxVideoFileSize}
                  onDelete={() => onRemoveAnswerMedia(index, "Video")}
                  oldImgUrl={currentVideoUrl}
                  uniqueName={"answer-video-" + answer.uuid}
                  localMediaUrl={
                    answer.unsavedVideo &&
                    URL.createObjectURL(answer.unsavedVideo)
                  }
                />
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

const ANSWERS_PER_PAGE = 50;

export default function CodedConcept(props) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");

  const visibleAnswers = useMemo(
    () =>
      props.answers
        .map((answer, index) => ({ answer, index }))
        .filter(({ answer }) => !answer.voided),
    [props.answers],
  );

  const filteredAnswers = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return visibleAnswers;
    return visibleAnswers.filter(({ answer }) =>
      (answer.name || "").toLowerCase().includes(term),
    );
  }, [visibleAnswers, filter]);

  const nonVoidedCount = visibleAnswers.length;
  const pageCount = Math.max(
    1,
    Math.ceil(filteredAnswers.length / ANSWERS_PER_PAGE),
  );

  // When a new answer is added the list grows; clear any filter and jump to the
  // last page so the newly added (empty-named) answer is actually visible.
  const prevCountRef = useRef(nonVoidedCount);
  useEffect(() => {
    if (nonVoidedCount > prevCountRef.current) {
      setFilter("");
      setPage(Math.max(1, Math.ceil(nonVoidedCount / ANSWERS_PER_PAGE)));
    }
    prevCountRef.current = nonVoidedCount;
  }, [nonVoidedCount]);

  // Keep the current page within range after deletes or filtering.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageAnswers = filteredAnswers.slice(
    (page - 1) * ANSWERS_PER_PAGE,
    page * ANSWERS_PER_PAGE,
  );

  return (
    <Box sx={{ mt: 2 }}>
      {/* Toolbar: sort, filter and a count */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <StyledButton
          type="button"
          color="primary"
          onClick={props.onAlphabeticalSort}
          size="medium"
        >
          Sort alphabetically
        </StyledButton>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Filter answers by name"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 320, backgroundColor: "background.paper" }}
        />
        <Box sx={{ ml: "auto", color: "text.secondary" }}>
          {filteredAnswers.length} answer
          {filteredAnswers.length === 1 ? "" : "s"}
          {filter.trim() ? ` (filtered from ${nonVoidedCount})` : ""}
        </Box>
      </Box>

      {/* Answers List (paginated) */}
      <Box sx={{ mb: 2 }}>
        {pageAnswers.map(({ answer, index }) => (
          <CodedConceptAnswer
            key={answer.uuid}
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
        ))}
      </Box>

      {pageCount > 1 && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}

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
  onToggleAnswerField: PropTypes.func.isRequired,
};
