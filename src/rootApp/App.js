import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Routes from "./Routes";
import { getUserInfo } from "./ducks";
import IdpDetails from "./security/IdpDetails";
import { httpClient } from "../common/utils/httpClient";

const App = () => {
  const dispatch = useDispatch();

  const appInitialised = useSelector(state => state.app.appInitialised);
  const sagaErrorState = useSelector(state => state.sagaErrorState);

  const { errorRaised, error } = sagaErrorState;

  useEffect(() => {
    if (httpClient.idp.idpType === IdpDetails.none) {
      dispatch(getUserInfo());
    }
  }, [dispatch]);

  if (errorRaised) throw error;

  return (
    appInitialised && (
      <div>
        <Routes />
      </div>
    )
  );
};

export default App;
