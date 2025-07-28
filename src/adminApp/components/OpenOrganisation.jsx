import { useDispatch } from "react-redux";
import { Link } from "@mui/material";
import { getUserInfo } from "../../rootApp/ducks";
import { useNavigate } from "react-router-dom";
import { useRecordContext } from "react-admin";

const OpenOrganisation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const record = useRecordContext();

  const handleClick = (event, organisationUUID) => {
    // Prevent the event from bubbling up to the Datagrid row
    event.stopPropagation();
    event.preventDefault();

    localStorage.setItem("ORGANISATION_UUID", organisationUUID);
    dispatch(getUserInfo());
    navigate("/home");
  };

  if (!record) {
    return null;
  }

  return (
    <Link component="button" onClick={event => handleClick(event, record.uuid)}>
      Go To Organisation
    </Link>
  );
};

export default OpenOrganisation;
