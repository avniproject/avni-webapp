import { act } from "react";
import { createRoot } from "react-dom/client";
import { httpClient } from "../../../common/utils/httpClient";
import {
  ApplyTemplateDialog,
  MAX_POLLING_TIME,
  POLLING_INTERVAL,
} from "./ApplyTemplateDialog";

jest.mock("../../../common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(), post: jest.fn() },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const status = (s) => ({ data: { applyTemplateJob: { status: s } } });

jest.setTimeout(60000);

describe("ApplyTemplateDialog (#1640)", () => {
  let container;
  let root;
  const onApplySuccess = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    httpClient.post.mockResolvedValue({});
    onApplySuccess.mockClear();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    jest.useRealTimers();
  });

  const applyAndWaitOutPollingWindow = async () => {
    await act(async () =>
      root.render(
        <ApplyTemplateDialog
          open
          onClose={jest.fn()}
          templateId="1"
          onApplySuccess={onApplySuccess}
        />,
      ),
    );
    const apply = [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "Apply",
    );
    await act(async () => apply.click());
    await act(async () => {
      await jest.advanceTimersByTimeAsync(
        MAX_POLLING_TIME + POLLING_INTERVAL * 2,
      );
    });
  };

  it("reports success when the job finished while the polling window ran out", async () => {
    // Still running for the whole window, then done by the time of the last look.
    httpClient.get.mockResolvedValue(status("STARTED"));
    httpClient.get.mockImplementation(() => {
      const lastLook =
        httpClient.get.mock.calls.length > MAX_POLLING_TIME / POLLING_INTERVAL;
      return Promise.resolve(status(lastLook ? "COMPLETED" : "STARTED"));
    });

    await applyAndWaitOutPollingWindow();

    expect(document.body.textContent).toContain("applied successfully");
    expect(document.body.textContent).not.toContain("longer than usual");
    expect(onApplySuccess).toHaveBeenCalledTimes(1);
  });

  it("says it may still be applying, and lets the user close the dialog, when the job is still running", async () => {
    httpClient.get.mockResolvedValue(status("STARTED"));

    await applyAndWaitOutPollingWindow();

    expect(document.body.textContent).toContain("longer than usual");
    expect(document.body.textContent).toContain("still be applying");
    const ok = [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "OK",
    );
    expect(ok.disabled).toBe(false);
    expect(onApplySuccess).not.toHaveBeenCalled();
  });
});
