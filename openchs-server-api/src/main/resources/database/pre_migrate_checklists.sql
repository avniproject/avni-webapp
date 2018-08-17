CREATE TABLE checklist_temp AS
  SELECT *
  FROM checklist;
CREATE TABLE checklist_item_temp AS
  SELECT *
  FROM checklist_item;

DELETE FROM checklist_item;
DELETE FROM checklist;
