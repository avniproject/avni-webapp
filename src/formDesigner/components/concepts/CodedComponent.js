import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import TagsInput from "react-tagsinput";
import _ from "lodash";
import { FormGroup, Label, Input } from "reactstrap";

const getExcludedAnswers = field => {
  let answers = [];
  for (const keyValue of field.keyValues) {
    if (keyValue.key === "ExcludedAnswers") {
      answers = keyValue.value;
      break;
    }
  }
  return answers;
};

class CodedComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      answers:
        (this.props.field.concept && this.props.field.concept.answers) || []
    };
  }

  onChangeAnswers(rawAnswers) {
    if (this.props.readOnly) {
      return;
    }

    const answers = this.state.answers;
    _.map(rawAnswers, rawAnswer => {
      const currentAnswer = _.find(answers, stateAnswer => {
        return stateAnswer.name === rawAnswer;
      });
      if (currentAnswer) {
        currentAnswer.name = rawAnswer;
      } else {
        answers.push({ name: rawAnswer });
      }
    });
    this.setState(...this.state, answers);
  }

  render() {
    const { field, handleFieldChange, handleKeyValuesChange } = this.props;
    const tagsFieldId = field.uuid + "_tags";
    const tags = _.map(
      field.concept.answers || field.concept.conceptAnswers,
      answer => answer.name
    );
    const readOnly = this.props.readOnly;
    const tagsFieldLabel = readOnly
      ? "Answers"
      : "Type your choices. Press enter after each choice.";

    const excludedAnswersId = field.uuid + "_excludedAnswers";
    const excludedAnswers = getExcludedAnswers(field);
    const ignoreThisParameter = false;

    return (
      <Fragment>
        <FormGroup>
          <Label for="elementType">Type</Label>
          <Input
            placeholder="Question title"
            id="elementType"
            name="type"
            type="select"
            onChange={({ target }) =>
              handleFieldChange(
                target.name,
                target.value ? target.value : null,
                field.uuid
              )
            }
            value={field.type}
          >
            <option />
            <option>SingleSelect</option>
            <option>MultiSelect</option>
          </Input>
        </FormGroup>
        <div className="form-group">
          <label htmlFor={tagsFieldId}>{tagsFieldLabel}</label>
          <TagsInput
            value={tags}
            onChange={this.onChangeAnswers.bind(this)}
            id={tagsFieldId}
            inputProps={{ placeholder: "Answer", disabled: readOnly }}
          />
        </div>
        <FormGroup>
          <Label for={excludedAnswersId}>Excluded Answers</Label>
          <TagsInput
            value={excludedAnswers}
            id={excludedAnswersId}
            inputProps={{ placeholder: "Add an answer" }}
            onChange={tags =>
              handleKeyValuesChange(
                "ExcludedAnswers",
                tags,
                ignoreThisParameter,
                field
              )
            }
          />
        </FormGroup>
      </Fragment>
    );
  }
}

CodedComponent.propTypes = {
  field: PropTypes.object
};

export default CodedComponent;
