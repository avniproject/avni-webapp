import { useDispatch } from "react-redux";
import { Link } from "@mui/material";
import { getUserInfo } from "../../rootApp/ducks";
import { useNavigate } from "react-router-dom";

const OpenOrganisation = ({ record }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = organisationUUID => {
    localStorage.setItem("ORGANISATION_UUID", organisationUUID);
    dispatch(getUserInfo());
    navigate("/home");
  };

  return (
    <Link component="button" onClick={() => handleClick(record.uuid)}>
      Go To Organisation
    </Link>
  );
};

export default OpenOrganisation;
