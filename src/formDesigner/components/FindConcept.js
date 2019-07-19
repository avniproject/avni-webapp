import React from "react";
import { Container, Row, Input, ListGroup, ListGroupItem } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";

class FindConcept extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      searchResults: []
    };
  }

  handleSearchChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });

    axios
      .get(`/search/concept?name=${event.target.value}`)
      .then(response => response.data)
      .then(concepts => this.setState({ searchResults: concepts }))
      .catch(err => {
        console.log(err);
      });
  };

  render = () => {
    const searchItems = this.state.searchResults.map(sR => (
      <ListGroupItem action>
        <Link to={{ pathname: `/concepts/${sR.id}`, state: { concept: sR } }}>
          {sR.name}
        </Link>
      </ListGroupItem>
    ));
    return (
      <div className="card">
        <div className="card-header">Find Concept(s)</div>
        <div className="card-body">
          <Container>
            <Row>
              <Input
                type="search"
                name="searchText"
                id="exampleSearch"
                placeholder="Name of a concept"
                value={this.state.searchText}
                onChange={this.handleSearchChange}
              />
            </Row>
            <Row>
              <ListGroup className="mt-3 w-100">{searchItems}</ListGroup>
            </Row>
          </Container>
        </div>
      </div>
    );
  };
}

export default FindConcept;
