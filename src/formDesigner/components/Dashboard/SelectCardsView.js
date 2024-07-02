import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Select from "react-select";
import _, { map } from "lodash";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";
import DashboardService from "../../../common/service/DashboardService";

export const SelectCardsView = ({ dashboardSection, addCards }) => {
  const [allCards, setAllCards] = React.useState([]);
  const [cardsToBeAdded, setCardsToBeAdded] = React.useState([]);
  const cardSelectRef = React.useRef(null);

  React.useEffect(() => {
    DashboardService.getAllReportCards().then(res => setAllCards(res));
  }, []);

  const onSelectChange = event => {
    const selectedCards = allCards.filter(a => _.some(event, lvPair => a.id === lvPair.value));
    setCardsToBeAdded(selectedCards);
  };

  const addCardsToDashboard = event => {
    event.preventDefault();
    addCards(cardsToBeAdded);
    setCardsToBeAdded([]);
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
            options={map(WebDashboardSection.getCardsNotAdded(dashboardSection, allCards), ({ id, name }) => ({
              label: name,
              value: id
            }))}
            onChange={onSelectChange}
            value={cardsToBeAdded.map(x => {
              return { value: x.id, label: x.name };
            })}
          />
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="primary" onClick={addCardsToDashboard} disabled={cardsToBeAdded.length === 0} fullWidth={true}>
            Add
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
