import { Component } from "react";
import { formatDistanceToNow, isValid } from "date-fns";
import { Link } from "react-router-dom";

class FormCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const form = this.props.form;
    const duration =
      form.lastModifiedDateTime && isValid(new Date(form.lastModifiedDateTime))
        ? formatDistanceToNow(new Date(form.lastModifiedDateTime), { addSuffix: true })
        : "-";
    const linkProps = {
      pathname: `/forms/${form.uuid}`,
      state: { formName: form.name }
    };

    return (
      <div className="col-md-3" key={form.uuid}>
        <div className="card h-100">
          <div className="card-body">
            <h4 className="card-title">
              <Link className={"text-primary"} to={linkProps}>
                {form.name}
              </Link>
            </h4>
            <h5>{form.formType}</h5>
            <Link className="btn btn-primary" to={linkProps}>
              Open
            </Link>
          </div>
          <div className="card-footer">
            <small className="text-muted">Last updated {duration} ago</small>
          </div>
        </div>
      </div>
    );
  }
}

export default FormCard;
