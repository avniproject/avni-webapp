import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import PropTypes from "prop-types";
import { Draggable, Droppable } from "react-beautiful-dnd";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
    height: "35px",
    width: "10%",
    marginTop: 20
  }
}));
export default function CodedConcept(props) {
  return (
    <>
      <Grid container style={{ marginTop: 20 }}>
        <Droppable droppableId={"Group0"}>
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {props.answers.map((answer, index) => {
                return (
                  !answer.voided && (
                    <Draggable draggableId={"Element" + index} index={index} key={index}>
                      {provided => (
                        <Grid
                          container
                          // style={{ border: "1px solid #ccc", margin: "2px" }}
                          key={index}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <FormControl>
                            <AutoSuggestSingleSelection
                              visibility={!answer.editable}
                              showAnswer={answer}
                              onChangeAnswerName={props.onChangeAnswerName}
                              index={index}
                              showSuggestionStartsWith={true}
                              placeholder="Enter answer"
                              label="Answer"
                            />
                          </FormControl>
                          <FormControl>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={answer.abnormal}
                                  onChange={e => props.onToggleAnswerField(e, index)}
                                  value={answer.abnormal}
                                  color="primary"
                                  id="abnormal"
                                />
                              }
                              label="abnormal"
                              style={{ marginTop: 15, marginLeft: 2 }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={answer.unique}
                                  onChange={e => props.onToggleAnswerField(e, index)}
                                  value={answer.unique}
                                  color="primary"
                                  id="unique"
                                />
                              }
                              label="unique"
                              style={{ marginTop: 15 }}
                            />
                          </FormControl>
                          <FormControl>
                            <IconButton
                              aria-label="delete"
                              onClick={() => {
                                props.onDeleteAnswer(index);
                              }}
                              style={{ marginTop: 10 }}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </FormControl>
                        </Grid>
                      )}
                    </Draggable>
                  )
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Grid>

      <Button
        type="button"
        className={useStyles.button}
        color="primary"
        onClick={props.onAddAnswer}
      >
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
