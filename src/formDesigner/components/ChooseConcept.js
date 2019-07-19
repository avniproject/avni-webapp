import React, { Fragment } from "react";
import Autosuggest from "react-autosuggest";
import {
  Label,
  FormGroup,
  Input,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";

import axios from "axios";

export default class ChooseConcept extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      modal: false,
      autoSuggestValue: props.concept.name
    };
  }

  onAutoSuggestChange = (event, { newValue, method }) => {
    this.setState({ autoSuggestValue: newValue });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    axios
      .get(`/search/concept?name=${value}`)
      .then(response => response.data)
      .then(concepts => this.setState({ suggestions: concepts }))
      .catch(err => {
        console.log(err);
      });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelected = (event, { suggestion }) => {
    this.setState({
      autoSuggestValue: "",
      modal: false
    });

    this.props.onConceptSelected(suggestion);
  };

  toggle = event => {
    this.setState({
      modal: !this.state.modal
    });
    event.preventDefault();
  };

  render() {
    const inputProps = {
      value: this.state.autoSuggestValue,
      onChange: this.onAutoSuggestChange
    };

    return (
      <Fragment>
        <FormGroup>
          <Label for="conceptName">Concept name</Label>
          <Row>
            <Col sm>
              <Input
                disabled
                value={this.props.concept.name}
                id="conceptName"
                type="text"
              />
            </Col>
            <Col>
              <div>
                <a href="#0" onClick={this.toggle}>
                  <u>Choose a different concept</u>
                </a>
                <Modal centered isOpen={this.state.modal} toggle={this.toggle}>
                  <ModalHeader toggle={this.toggle}>
                    {this.props.modalHeader}
                  </ModalHeader>
                  <ModalBody>
                    <form onSubmit={e => e.preventDefault()}>
                      <FormGroup>
                        <Label for="findConcept">Find Concept</Label>
                        <Autosuggest
                          id={this.props.id}
                          suggestions={this.state.suggestions}
                          onSuggestionsFetchRequested={
                            this.onSuggestionsFetchRequested
                          }
                          onSuggestionsClearRequested={
                            this.onSuggestionsClearRequested
                          }
                          onSuggestionSelected={this.onSuggestionSelected}
                          getSuggestionValue={concept => concept.name}
                          renderSuggestion={concept => (
                            <span>{concept.name}</span>
                          )}
                          inputProps={inputProps}
                        />
                      </FormGroup>
                    </form>
                  </ModalBody>
                </Modal>
              </div>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <Label for="dataType">Datatype</Label>
          <Input
            disabled
            value={this.props.concept.dataType}
            id="dataType"
            type="text"
          />
        </FormGroup>
      </Fragment>
    );
  }
}
