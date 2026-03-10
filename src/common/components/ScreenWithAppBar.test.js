import { getSidebarLinkTo, shouldUpdateSelectedIndexOnClick, getSelectedListItem } from "./ScreenWithAppBarUtils";
import { assert } from "chai";

describe("ScreenWithAppBar", () => {
  describe("getSidebarLinkTo", () => {
    it("should return path with ?page=0 for plain href", () => {
      assert.equal(getSidebarLinkTo("reports"), "reports?page=0");
      assert.equal(getSidebarLinkTo("/reports/export"), "/reports/export?page=0");
    });

    it("should strip leading # and append ?page=0 for hash href", () => {
      assert.equal(getSidebarLinkTo("#reports"), "reports?page=0");
      assert.equal(getSidebarLinkTo("#reports/export"), "reports/export?page=0");
    });
  });

  describe("shouldUpdateSelectedIndexOnClick", () => {
    it("should return true for normal click (no modifier keys)", () => {
      assert.isTrue(shouldUpdateSelectedIndexOnClick({ metaKey: false, ctrlKey: false }));
    });

    it("should return false when metaKey is pressed (Cmd+click on Mac)", () => {
      assert.isFalse(shouldUpdateSelectedIndexOnClick({ metaKey: true, ctrlKey: false }));
    });

    it("should return false when ctrlKey is pressed (Ctrl+click on Windows/Linux)", () => {
      assert.isFalse(shouldUpdateSelectedIndexOnClick({ metaKey: false, ctrlKey: true }));
    });

    it("should return false when both metaKey and ctrlKey are pressed", () => {
      assert.isFalse(shouldUpdateSelectedIndexOnClick({ metaKey: true, ctrlKey: true }));
    });
  });

  describe("getSelectedListItem", () => {
    it("should return 0 when sidebarOptions is empty", () => {
      assert.equal(getSelectedListItem([]), 0);
    });

    it("should return 0 when sidebarOptions is undefined or null", () => {
      assert.equal(getSelectedListItem(undefined), 0);
      assert.equal(getSelectedListItem(null), 0);
    });
  });
});
