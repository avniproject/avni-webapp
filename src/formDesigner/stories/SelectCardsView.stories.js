import React from "react";
import { SelectCardsView } from "../components/Dashboard/SelectCardsView";

export default {
  component: SelectCardsView,
  title: "formDesigner/components/Dashboard/SelectCardsView"
};

const Template = args => <SelectCardsView {...args} />;

export const dashboard = Template.bind({});
dashboard.args = {
  dashboardCards: [
    { id: 12, name: "card 1", description: "same card 1 description", displayOrder: 1 },
    { id: 13, name: "card 2", description: "same card 2 description", displayOrder: 3 },
    { id: 14, name: "card 3", description: "same card 3 description", displayOrder: 2 }
  ]
};
