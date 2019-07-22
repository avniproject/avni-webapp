import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FormGroup, Label, Input, Collapse, Button } from "reactstrap";

import config from "../../config";
import ChooseConcept from "../ChooseConcept";

function editable(field) {
  for (const keyValue of field.keyValues) {
    if (keyValue.key === "editable") {
      return keyValue.value;
    }
  }
  return false;
}

class ConceptComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapse: false };
  }

  toggle = () => {
    this.setState(prevState => ({
      collapse: !prevState.collapse
    }));
  };

  render() {
    const {
      field,
      handleFieldChange,
      handleKeyValuesChange,
      children
    } = this.props;
    const headerId = "heading_" + field.uuid;

    return (
      <Card>
        <CardHeader className="py-2" id={headerId}>
          <Row>
            <Col sm="7">
              <Button
                color="link"
                className={config.orgClassName(field.organisationId)}
                onClick={() =>
                  handleFieldChange("collapse", !field.collapse, field.uuid)
                }
              >
                {field.name}
              </Button>
            </Col>
            <Col>
              <CopyToClipboard text={field.uuid}>
                <div>
                  <a
                    href="#0"
                    id={`_${field.uuid}_uuid`}
                    className="badge badge-secondary"
                  >
                    {field.uuid}
                  </a>
                  <UncontrolledTooltip
                    placement="bottom"
                    target={`_${field.uuid}_uuid`}
                  >
                    Click to copy the uuid
                  </UncontrolledTooltip>
                  {/* icon is looking ugly so commenting it out for now */}
                  {/* <i class="fa fa-clipboard" aria-hidden="true"></i> */}
                </div>
              </CopyToClipboard>
            </Col>
          </Row>
        </CardHeader>

        <Collapse isOpen={field.collapse === false}>
          <div aria-labelledby={headerId} data-parent="#accordion">
            <CardBody>
              <FormGroup>
                <Label for="elementName">Element name</Label>
                <Input
                  placeholder="Question title"
                  id="elementName"
                  name="name"
                  type="text"
                  onChange={({ target }) =>
                    handleFieldChange(target.name, target.value, field.uuid)
                  }
                  value={field.name}
                />
              </FormGroup>

              <ChooseConcept
                id="chooseConcept"
                concept={field.concept}
                value={field.concept.name}
                modalHeader="Choose Concept"
                onConceptSelected={concept =>
                  handleFieldChange("concept", concept, field.uuid)
                }
              />

              {children}

              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    id={field.uuid + "_editable"}
                    onChange={({ target }) =>
                      handleKeyValuesChange(
                        "editable",
                        target.checked,
                        target.checked,
                        field
                      )
                    }
                    checked={editable(this.props.field)}
                  />
                  Editable
                </Label>
              </FormGroup>

              <FormGroup check>
                <Label check>
                  <Input
                    name="mandatory"
                    type="checkbox"
                    id={field.uuid + "_mandatory"}
                    onChange={({ target }) =>
                      handleFieldChange(target.name, target.checked, field.uuid)
                    }
                    checked={field.mandatory}
                  />
                  Required
                </Label>
              </FormGroup>
            </CardBody>
          </div>
        </Collapse>
      </Card>
    );
  }
}

ConceptComponent.propTypes = {
  field: PropTypes.object.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired
};

export default ConceptComponent;
