import React from "react";
import {
  Label,
  FormGroup,
  Container,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "reactstrap";
import Autosuggest from "react-autosuggest";
import uuidv4 from "uuid/v4";
import axios from "axios";

import Breadcrumb from "./Breadcrumb";

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

function renderSuggestion(suggestion) {
  return <span>{suggestion.name}</span>;
}

class NewConcept extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      dataType: "Coded",
      tags: [],
      autoSuggestValue: "",
      suggestions: [],
      selectedAnswers: [],
      showSearchModal: false,
      modal: false,
      selectedSuggestion: null
    };
    this.onChangeField = this.onChangeField.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  onSuggestionSelected = (event, { suggestion }) => {
    this.setState({ selectedSuggestion: suggestion });
  };

  onAddSuggestion = event => {
    if (this.state.selectedSuggestion != null) {
      this.setState(prevState => ({
        selectedAnswers: [
          ...prevState.selectedAnswers,
          prevState.selectedSuggestion
        ],
        autoSuggestValue: "",
        selectedSuggestion: null,
        modal: false
      }));
    }
  };

  onAutoSuggestChange = (event, { newValue, method }) => {
    this.setState({ autoSuggestValue: newValue });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    axios
      .get(`/search/concept?name=${value}`)
      .then(response => response.data)
      .then(conceptAnswers => this.setState({ suggestions: conceptAnswers }))
      .catch(err => {
        console.log(err);
      });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  onChangeField(event) {
    const name = event.target.name;
    const value = event.target.value;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    let concept = { uuid: uuidv4() };
    concept["name"] = this.state.name;
    concept["dataType"] = this.state.dataType;
    concept["answers"] = this.state.selectedAnswers.map(sA => ({
      uuid: sA.uuid,
      name: sA.name
    }));
    const concepts = [concept];

    //alert(JSON.stringify(this.state.selectedAnswers.map((sA) => sA.name)));
    alert(JSON.stringify(concepts));

    axios
      .post("/concepts", concepts)
      .then(response => alert("Concept Created"))
      .catch(err => {
        console.log(err);
      });

    event.preventDefault();
  }

  handleChange(tags) {
    this.setState({ tags });
  }

  render() {
    const { autoSuggestValue, suggestions, selectedAnswers } = this.state;
    const inputProps = {
      value: autoSuggestValue,
      onChange: this.onAutoSuggestChange
    };
    const optionItems = selectedAnswers.map(sA => (
      <option key={sA.uuid} value={sA.uuid}>
        {sA.name}
      </option>
    ));

    return (
      <div className="container">
        <Breadcrumb location={this.props.location} />
        <div>
          <Container>
            <Row>
              <Col sm={8}>
                <form onSubmit={this.handleSubmit}>
                  <div className="form-group has-danger">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      className="form-control form-control-danger"
                      id="name"
                      value={this.state.name}
                      name="name"
                      placeholder="Enter concept name"
                      onChange={this.onChangeField}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dataType">Concept Type</label>
                    <select
                      className="form-control"
                      id="dataType"
                      value={this.state.dataType}
                      name="dataType"
                      onChange={this.onChangeField}
                    >
                      <option>NA</option>
                      {/* <option>Numeric</option>
                    <option>Text</option> */}
                      <option>Coded</option>
                      {/* <option>Date</option> */}
                    </select>
                  </div>
                  {this.state.dataType === "Coded" && (
                    <div className="form-group">
                      <label htmlFor="selectedAnswers">Selected Answers</label>
                      <div className="form-row">
                        <div className="col-10">
                          <select
                            className="form-control"
                            id="selectedAnswers"
                            multiple={true}
                            name="selectedAnswers"
                          >
                            {optionItems}
                          </select>
                        </div>
                        <div className="col-1">
                          <Button onClick={this.toggle} color="secondary">
                            Add
                          </Button>
                          <Button color="secondary">Remove</Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {this.state.dataType === "Numeric" && (
                    <div className="form-row">
                      <div className="form-group col-md-2">
                        <label htmlFor="lowAbsolute">Low Absolute</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lowAbsolute"
                        />
                      </div>
                      <div className="form-group col-md-2">
                        <label htmlFor="highAbsolute">High Absolute</label>
                        <input
                          type="text"
                          className="form-control"
                          id="highAbsolute"
                        />
                      </div>
                      <div className="form-group col-md-2">
                        <label htmlFor="lowNormal">Low Normal</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lowNormal"
                        />
                      </div>
                      <div className="form-group col-md-2">
                        <label htmlFor="highNormal">High Normal</label>
                        <input
                          type="text"
                          className="form-control"
                          id="highNormal"
                        />
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="unit">Unit</label>
                        <select id="unit" className="form-control">
                          <option defaultValue="">Choose...</option>
                          <option>cm</option>
                          <option>kg</option>
                          <option>mm Hg</option>
                          <option>g/dL</option>
                          <option>beats/minute</option>
                          <option>breaths/minute</option>
                          <option>&#8451;</option>
                          <option>&#8457;</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <input
                    className="btn btn-primary btn-block"
                    type="submit"
                    value="Create"
                  />
                </form>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                  <ModalHeader toggle={this.toggle}>
                    Choose an answer
                  </ModalHeader>
                  <ModalBody>
                    <form onSubmit={e => e.preventDefault()}>
                      <FormGroup>
                        <Label for="findConcept">Find Concept</Label>
                        <Autosuggest
                          id="findConcept"
                          suggestions={suggestions}
                          onSuggestionsFetchRequested={
                            this.onSuggestionsFetchRequested
                          }
                          onSuggestionsClearRequested={
                            this.onSuggestionsClearRequested
                          }
                          onSuggestionSelected={this.onSuggestionSelected}
                          getSuggestionValue={getSuggestionValue}
                          renderSuggestion={renderSuggestion}
                          inputProps={inputProps}
                        />
                      </FormGroup>
                    </form>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onClick={this.onAddSuggestion}>
                      Add
                    </Button>{" "}
                    <Button color="secondary" onClick={this.toggle}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </Modal>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

export default NewConcept;
