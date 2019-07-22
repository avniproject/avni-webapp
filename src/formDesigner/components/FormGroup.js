import React, { Component } from "react";
import fieldsMetadata from "./configFields";
import PropTypes from "prop-types";
import _ from "lodash";
import { Row, Col, UncontrolledTooltip, Collapse, Button } from "reactstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";

import ConceptComponent from "./concepts/ConceptComponent";
import config from "../config";

class FormGroup extends Component {
  constructor(props) {
    super(props);
    this.state = { collapse: false };
  }

  toggle = () => {
    this.setState(prevState => ({
      collapse: !prevState.collapse
    }));
  };

  renderGroup() {
    const { group, handleGroupChange } = this.props;
    const groupId = group.groupId;
    const headerId = "heading_" + groupId;
    const formHeader = group.name
      ? " " + group.name
      : group.display
      ? " " + group.display
      : "";
    return (
      <div className="card">
        <div className="card-header py-2" id={headerId}>
          <Row>
            <Col sm="7">
              <Button
                color="link"
                className={config.orgClassName(group.organisationId)}
                onClick={() =>
                  handleGroupChange("collapse", !group.collapse, group.uuid)
                }
              >
                <strong>{formHeader}</strong>
              </Button>
            </Col>
            <Col>
              <CopyToClipboard text={group.uuid}>
                <div>
                  <a
                    href="#0"
                    id="form-group-uuid"
                    className="badge badge-secondary"
                  >
                    {group.uuid}
                  </a>
                  <UncontrolledTooltip
                    placement="bottom"
                    target="form-group-uuid"
                  >
                    Click to copy the uuid
                  </UncontrolledTooltip>
                  {/* <i class="fa fa-clipboard" aria-hidden="true"></i> */}
                </div>
              </CopyToClipboard>
            </Col>
          </Row>
        </div>

        <Collapse isOpen={group.collapse === false}>
          <div aria-labelledby={headerId} data-parent="#accordion">
            <div className="card-body">
              <div className="form-row">
                <div className="form-inline mb-2">
                  <label htmlFor="groupName" className="mr-sm-2">
                    Group:{" "}
                  </label>
                  <input
                    type="text"
                    className="form-control mb-2 mr-sm-2 mb-sm-0"
                    id={groupId + "_groupName"}
                    placeholder="Enter group"
                    value={group.name}
                    name="name"
                    onChange={({ target }) =>
                      handleGroupChange(target.name, target.value, group.uuid)
                    }
                  />

                  <label htmlFor="groupDisplay" className="mr-sm-2">
                    Display:
                  </label>
                  <input
                    type="text"
                    className="form-control mb-2 mr-sm-2 mb-sm-0"
                    id={groupId + "_groupDisplay"}
                    name="display"
                    placeholder="Enter display"
                    value={group.display}
                    onChange={({ target }) =>
                      handleGroupChange(target.name, target.value, group.uuid)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    );
  }

  renderFields() {
    const inputFields = [];
    _.forEach(this.props.fields, inputField => {
      if (!inputField.concept) {
        console.error("Null concept for: " + inputField.name);
        console.error(
          " name, " + inputField.name + ", type: " + inputField.type
        );
      }
      const fieldMetadata = _.find(fieldsMetadata, metadata => {
        return (
          inputField.concept &&
          metadata.dataType === inputField.concept.dataType
        );
      });
      if (!fieldMetadata) {
        console.error(
          "No field metadata found for " +
            (inputField.name + ", dataType " + inputField.dataType)
        );
      } else {
        const readonly = true;
        const fieldComponent = fieldMetadata.component(
          this.props.group.groupId,
          inputField,
          readonly,
          this.props.handleKeyValuesChange,
          this.props.handleFieldChange
        );

        inputFields.push(
          <div className="row" key={inputField.uuid}>
            <div className="col-12">
              <ConceptComponent
                field={inputField}
                handleFieldChange={this.props.handleFieldChange}
                handleKeyValuesChange={this.props.handleKeyValuesChange}
              >
                {fieldComponent}
              </ConceptComponent>
            </div>
          </div>
        );
      }
    });
    return inputFields;
  }

  render() {
    return (
      <div>
        {this.renderGroup()}
        <div id="accordion" role="tablist">
          {this.renderFields()}
        </div>
      </div>
    );
  }
}

FormGroup.propTypes = {
  group: PropTypes.object.isRequired,
  handleGroupChange: PropTypes.func.isRequired,
  handleKeyValuesChange: PropTypes.func.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  fields: PropTypes.array
};

export default FormGroup;
