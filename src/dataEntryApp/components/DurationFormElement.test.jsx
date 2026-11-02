import { act } from "react";
import { createRoot } from "react-dom/client";
import { CompositeDuration } from "avni-models";
import DurationFormElement from "./DurationFormElement";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const formElement = {
  name: "Duration",
  mandatory: false,
  durationOptions: ["hours", "minutes"],
  questionGroupIndex: undefined,
};

const render = async (value, update = jest.fn(), validationResults = []) =>
  act(async () => {
    root.render(
      <DurationFormElement
        formElement={formElement}
        value={value}
        update={update}
        validationResults={validationResults}
        uuid="duration-uuid"
      />,
    );
  });

const changeInput = async (input, value) =>
  act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    input.dispatchEvent(new window.Event("change", { bubbles: true }));
  });

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("DurationFormElement", () => {
  it("updates the duration when a value is entered", async () => {
    const update = jest.fn();
    const value = CompositeDuration.fromOpts(["hours", "minutes"]);

    await render(value, update);

    const hoursInput = container.querySelector('input[name="Duration0"]');
    await changeInput(hoursInput, "12");

    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0].findByUnit("hours").durationValue).toBe(
      "12",
    );
  });

  it("clears a previously entered duration value", async () => {
    let currentValue = CompositeDuration.fromOpts(["hours", "minutes"]);
    const update = jest.fn((nextValue) => {
      currentValue = nextValue;
    });

    await render(currentValue, update);

    const hoursInput = container.querySelector('input[name="Duration0"]');

    await changeInput(hoursInput, "12");
    await render(currentValue, update);

    await changeInput(hoursInput, "");
    expect(update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        durations: expect.any(Array),
      }),
    );
    await render(currentValue, update);

    expect(hoursInput.value).toBe("");
    expect(currentValue.findByUnit("hours").isEmpty).toBe(true);
  });

  it("shows validation feedback only for an empty duration unit when invalid", async () => {
    const value = CompositeDuration.fromOpts([
      "hours",
      "minutes",
    ]).changeValueByUnit("hours", "12");

    const validationResults = [
      {
        formIdentifier: "duration-uuid",
        questionGroupIndex: undefined,
        success: false,
        messageKey: "required",
      },
    ];

    await render(value, jest.fn(), validationResults);

    const hoursInput = container.querySelector('input[name="Duration0"]');
    const minutesInput = container.querySelector('input[name="Duration1"]');

    expect(
      hoursInput.closest(".MuiFormControl-root").querySelector(".Mui-error"),
    ).toBeNull();

    expect(
      minutesInput.closest(".MuiFormControl-root").querySelector(".Mui-error"),
    ).not.toBeNull();
  });
});
