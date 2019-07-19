import React, { Component } from "react";
import { MenuItem } from "react-bootstrap";

class FieldsPanel extends Component {
  static addFieldsRow(fields, groupId, rowNum) {
    return (
      <div
        className="row list-group-horizontal list-unstyled"
        key={groupId + "_fields_" + rowNum}
      >
        {fields}
      </div>
    );
  }

  // renderFields() {
  //   const onClick = this.props.onClick;
  //   let rows = [];
  //   let cols = [];
  //   _.forEach(fieldsMetadata, (fieldMetadata) => {
  //     cols.push(
  //       <div className="col-4 list-group-item" key={fieldMetadata.icon + this.props.groupId}>
  //         <MenuItem key={fieldMetadata.icon} eventKey={fieldMetadata.icon}
  //           onClick={() => onClick(fieldMetadata, this.props.groupId)}
  //           name={fieldMetadata.icon}>
  //           <FieldIcon fieldMetadata={fieldMetadata} />{" " + fieldMetadata.label}
  //         </MenuItem>
  //       </div>);
  //     if (cols === 3) {
  //       rows.push(FieldsPanel.addFieldsRow(cols, this.props.groupId, rows.length));
  //       cols = [];
  //     }
  //   });
  //   if (cols.length > 0) {
  //     rows.push(FieldsPanel.addFieldsRow(cols, this.props.groupId, rows.length));
  //   }
  //   return rows;
  // }

  render() {
    const groupName = this.props.groupName
      ? " for group '" + this.props.groupName + "'"
      : "";
    const onClick = this.props.onClick;
    return (
      <div className="card">
        <div className="card-header">
          <strong>Select Field{groupName}</strong>
        </div>
        <div className="card-body">
          <div className="row list-group-horizontal list-unstyled">
            <div className="list-group-item">
              <MenuItem
                href="#0"
                onClick={() => onClick("Group", this.props.groupId)}
              >
                Group
              </MenuItem>
            </div>
            <div className="list-group-item">
              <MenuItem
                href="#0"
                onClick={() => onClick("Field", this.props.groupId)}
              >
                Field
              </MenuItem>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FieldsPanel;
