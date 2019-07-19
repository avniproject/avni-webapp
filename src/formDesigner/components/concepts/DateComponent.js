import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormGroup } from "reactstrap";

const dateSubFields = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" }
];

function checked(field, dateSubField) {
  for (const keyValue of field.keyValues) {
    if (keyValue.key === "durationOptions") {
      return keyValue.value.includes(dateSubField.value);
    }
  }
  return false;
}

class DateComponent extends Component {
  renderDateSubField(dateSubField) {
    const dateSubFieldId = dateSubField.value + "_" + this.props.field.uuid;

    return (
      <div className="form-check form-check-inline" key={dateSubFieldId}>
        <label className="form-check-label">
          <input
            checked={checked(this.props.field, dateSubField)}
            onChange={({ target }) =>
              this.props.handleKeyValuesChange(
                "durationOptions",
                dateSubField.value,
                target.checked,
                this.props.field
              )
            }
            className="form-check-input"
            type="checkbox"
            id={dateSubFieldId}
          />
          {dateSubField.label}
        </label>
      </div>
    );
  }

  render() {
    return (
      <FormGroup>
        {dateSubFields.map(dateSubField =>
          this.renderDateSubField(dateSubField)
        )}
      </FormGroup>
    );
  }
}

DateComponent.propTypes = {
  field: PropTypes.object
};

export default DateComponent;
