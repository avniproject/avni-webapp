import React from "react";
import DraggableDashboardCards from "../components/Dashboard/DraggableDashboardCards";

export default {
  component: DraggableDashboardCards,
  title: "formDesigner/components/Dashboard/DraggableDashboardCards"
};

const Template = args => <DraggableDashboardCards {...args} />;

export const dashboard = Template.bind({});
dashboard.args = {
  name: "test dashboard",
  cards: [
    { id: 12, name: "card 1", description: "same card 1 description", displayOrder: 1 },
    { id: 13, name: "card 2", description: "same card 2 description", displayOrder: 3 },
    { id: 14, name: "card 3", description: "same card 3 description", displayOrder: 2 }
  ]
};
