import GroupModel from "./GroupModel";
import { assert } from "chai";

describe("GroupModel.nonRemovableGroup", () => {
  it("returns true for Everyone", () => {
    assert.isTrue(GroupModel.nonRemovableGroup(GroupModel.Everyone));
  });

  it("returns true for Administrators", () => {
    assert.isTrue(GroupModel.nonRemovableGroup(GroupModel.Administrators));
  });

  it("returns true for Metabase Users", () => {
    assert.isTrue(GroupModel.nonRemovableGroup(GroupModel.MetabaseUsers));
  });

  it("returns true for SQLite Migration", () => {
    assert.isTrue(GroupModel.nonRemovableGroup(GroupModel.SqliteMigration));
  });

  it("returns true for the literal string 'SQLite Migration'", () => {
    assert.isTrue(GroupModel.nonRemovableGroup("SQLite Migration"));
  });

  it("returns false for a custom group name", () => {
    assert.isFalse(GroupModel.nonRemovableGroup("My Custom Group"));
  });
});
