import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import http from "../../../common/utils/httpClient";
import Select from "react-select";
import { differenceBy, intersectionWith, map } from "lodash";

export const SelectCardsView = ({ dashboardCards, addCards }) => {
  const [cards, setCards] = React.useState([]);
  const [cardsToBeAdded, setCardsToBeAdded] = React.useState([]);
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const cardSelectRef = React.useRef(null);

  React.useEffect(() => {
    http
      .get(`/web/reportCard`)
      .then(res => res.data)
      .then(res => setCards(res));
  }, []);

  const onSelectChange = event => {
    setCardsToBeAdded(event);
    event && event.length > 0 ? setButtonDisabled(false) : setButtonDisabled(true);
  };

  const addCardsToDashboard = event => {
    event.preventDefault();
    cardSelectRef.current.select.clearValue();
    addCards(intersectionWith(cards, cardsToBeAdded, (c, s) => c.id === s.value));
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <Select
            name="addCard"
            ref={cardSelectRef}
            isMulti
            isSearchable
            options={map(differenceBy(cards, dashboardCards, "id"), ({ id, name }) => ({
              label: name,
              value: id
            }))}
            onChange={onSelectChange}
          />
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="primary" onClick={addCardsToDashboard} disabled={buttonDisabled} fullWidth={true}>
            Add
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
