import React from "react";
import { Modal, Button } from "react-bootstrap";

class SearchAnswersModal extends React.Component {
  render() {
    return (
      <Modal {...this.props} bsSize="small" aria-labelledby="modal-title">
        <Modal.Header closeButton>
          <Modal.Title id="modal-title">Search Answers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Search Text</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default SearchAnswersModal;
