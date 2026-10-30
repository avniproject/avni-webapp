import StringUtil from "./StringUtil";
import { assert } from "chai";

describe("StringUtil.anyContainsIgnoringCase", () => {
  it("matches part of a value ignoring upper and lower case", () => {
    assert.isTrue(StringUtil.anyContainsIgnoringCase("houseHOLD", "Household survey"));
    assert.isTrue(StringUtil.anyContainsIgnoringCase("SURVEY", "Household survey"));
    assert.isFalse(StringUtil.anyContainsIgnoringCase("ward", "Household survey"));
  });

  it("matches when any one of the values contains the text", () => {
    assert.isTrue(StringUtil.anyContainsIgnoringCase("son", "Father", "Son"));
    assert.isFalse(StringUtil.anyContainsIgnoringCase("aunt", "Father", "Son"));
  });

  it("treats an empty or blank search as matching everything", () => {
    assert.isTrue(StringUtil.anyContainsIgnoringCase("", "Household"));
    assert.isTrue(StringUtil.anyContainsIgnoringCase("   ", "Household"));
    assert.isTrue(StringUtil.anyContainsIgnoringCase(undefined, "Household"));
  });

  it("skips missing values", () => {
    assert.isFalse(StringUtil.anyContainsIgnoringCase("a", null, undefined));
    assert.isTrue(StringUtil.anyContainsIgnoringCase("a", null, "Calendar"));
  });
});

describe("StringUtil.compareIgnoringCase", () => {
  it("orders names alphabetically regardless of upper and lower case", () => {
    const names = ["QA1461 Grandson", "qa1461 GRANDFATHER", "QA1461 Father"];
    assert.deepEqual([...names].sort(StringUtil.compareIgnoringCase), ["QA1461 Father", "qa1461 GRANDFATHER", "QA1461 Grandson"]);
  });

  it("treats missing values as empty text", () => {
    assert.isBelow(StringUtil.compareIgnoringCase(undefined, "Son"), 0);
    assert.equal(StringUtil.compareIgnoringCase(null, ""), 0);
  });
});
