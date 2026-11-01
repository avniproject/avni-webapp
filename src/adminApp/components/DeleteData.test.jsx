import { act } from "react";
import { createRoot } from "react-dom/client";
import { httpClient } from "common/utils/httpClient";
import {
  DeleteData,
  DELETE_JOB_MAX_POLLING_TIME,
  DELETE_JOB_POLLING_INTERVAL,
} from "./DeleteData";

jest.mock("common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.setTimeout(120000);

// As GET /implementation/delete/job/status answers it.
const jobStatus = (status, exitMessage = null) => ({
  data: {
    status,
    createDateTime: null,
    startDateTime: null,
    endDateTime: null,
    exitMessage,
    exitCode: null,
  },
});

const ORG_NAME = "zz Delete Test";

// Status answers in order; the last one repeats.
const statusSequence = (...statuses) => {
  let i = 0;
  httpClient.get.mockImplementation(() =>
    Promise.resolve(statuses[Math.min(i++, statuses.length - 1)]),
  );
};

describe("DeleteData (#1639)", () => {
  let container;
  let root;
  let setOpenModal;
  let setDataDeletedIndicator;

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    setOpenModal = jest.fn();
    setDataDeletedIndicator = jest.fn();
    httpClient.get.mockReset();
    httpClient.post.mockReset();
    httpClient.delete.mockReset();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    document.body.innerHTML = "";
    jest.useRealTimers();
  });

  const render = async (openModal) =>
    act(async () =>
      root.render(
        <DeleteData
          openModal={openModal}
          setOpenModal={setOpenModal}
          orgName={ORG_NAME}
          hasOrgMetadataDeletionPrivilege
          hasOrgAdminConfigDeletionPrivilege
          setDataDeletedIndicator={setDataDeletedIndicator}
        />,
      ),
    );

  const button = (label) =>
    [...document.querySelectorAll("button")].find(
      (b) => b.textContent === label,
    );

  const typeOrgNameAndDelete = async () => {
    const input = document.querySelector("input[type='text']");
    const setValue = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    await act(async () => {
      setValue.call(input, ORG_NAME);
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await act(async () => button("Delete").click());
  };

  const advance = async (ms) =>
    act(async () => {
      await jest.advanceTimersByTimeAsync(ms);
    });

  const text = () => document.body.textContent;

  it("starts the background job, polls it and says when the data is deleted", async () => {
    statusSequence(
      jobStatus("NOT_FOUND"),
      jobStatus("STARTING"),
      jobStatus("STARTED"),
      jobStatus("COMPLETED"),
    );
    httpClient.post.mockResolvedValue({ status: 202, data: "job-uuid" });
    await render(true);

    await typeOrgNameAndDelete();

    expect(httpClient.post).toHaveBeenCalledWith(
      "/implementation/delete/job?deleteMetadata=false&deleteAdminConfig=false",
    );
    expect(httpClient.delete).not.toHaveBeenCalled();
    expect(text()).toContain("Starting");

    await advance(DELETE_JOB_POLLING_INTERVAL);
    expect(text()).toContain("Starting");
    await advance(DELETE_JOB_POLLING_INTERVAL);
    expect(text()).toContain("in progress");
    expect(button("OK").disabled).toBe(true);

    await advance(DELETE_JOB_POLLING_INTERVAL);
    expect(text()).toContain("Data deleted");
    expect(button("OK").disabled).toBe(false);
    expect(setDataDeletedIndicator).toHaveBeenCalledTimes(1);

    // Polling stopped.
    const calls = httpClient.get.mock.calls.length;
    await advance(DELETE_JOB_POLLING_INTERVAL * 3);
    expect(httpClient.get.mock.calls.length).toBe(calls);
  });

  it("shows the reason when the job fails", async () => {
    statusSequence(
      jobStatus("NOT_FOUND"),
      jobStatus("STARTED"),
      jobStatus("FAILED", "Deletion failed: some table is locked"),
    );
    httpClient.post.mockResolvedValue({ status: 202, data: "job-uuid" });
    await render(true);

    await typeOrgNameAndDelete();
    await advance(DELETE_JOB_POLLING_INTERVAL * 2);

    expect(text()).toContain("Could not delete data");
    expect(text()).toContain("Deletion failed: some table is locked");
    expect(button("OK").disabled).toBe(false);
    expect(setDataDeletedIndicator).not.toHaveBeenCalled();
  });

  it("shows the server's message when the job cannot be started", async () => {
    statusSequence(jobStatus("NOT_FOUND"));
    httpClient.post.mockRejectedValue({
      message: "Request failed with status code 400",
      response: {
        status: 400,
        data: "Production and UAT organisation data cannot be deleted",
      },
    });
    await render(true);

    await typeOrgNameAndDelete();

    expect(text()).toContain(
      "Production and UAT organisation data cannot be deleted",
    );
    expect(text()).not.toContain("status code 400");
    // Nothing to poll.
    const calls = httpClient.get.mock.calls.length;
    await advance(DELETE_JOB_POLLING_INTERVAL * 2);
    expect(httpClient.get.mock.calls.length).toBe(calls);
  });

  it("shows a deletion that is already running when the screen opens", async () => {
    statusSequence(jobStatus("STARTED"), jobStatus("COMPLETED"));
    await render(false);

    expect(httpClient.get).toHaveBeenCalledWith(
      "/implementation/delete/job/status",
    );
    expect(text()).toContain("in progress");

    await advance(DELETE_JOB_POLLING_INTERVAL);
    expect(text()).toContain("Data deleted");
  });

  it("shows nothing on open when the last deletion has already finished", async () => {
    statusSequence(jobStatus("COMPLETED"));
    await render(false);

    expect(text()).not.toContain("Data deleted");
    expect(text()).not.toContain("in progress");
  });

  it("when the polling window ends, checks once more and says it may still be running, closable", async () => {
    statusSequence(jobStatus("NOT_FOUND"), jobStatus("STARTED"));
    httpClient.post.mockResolvedValue({ status: 202, data: "job-uuid" });
    await render(true);

    await typeOrgNameAndDelete();
    await advance(
      DELETE_JOB_MAX_POLLING_TIME + DELETE_JOB_POLLING_INTERVAL * 2,
    );

    expect(text()).toContain("may still be running");
    expect(button("OK").disabled).toBe(false);
  });

  it("when the polling window ends and the last look finds it done, says the data is deleted", async () => {
    httpClient.post.mockResolvedValue({ status: 202, data: "job-uuid" });
    httpClient.get.mockImplementation(() => {
      const n = httpClient.get.mock.calls.length;
      if (n === 1) return Promise.resolve(jobStatus("NOT_FOUND"));
      const lastLook =
        n > DELETE_JOB_MAX_POLLING_TIME / DELETE_JOB_POLLING_INTERVAL + 1;
      return Promise.resolve(jobStatus(lastLook ? "COMPLETED" : "STARTED"));
    });
    await render(true);

    await typeOrgNameAndDelete();
    await advance(
      DELETE_JOB_MAX_POLLING_TIME + DELETE_JOB_POLLING_INTERVAL * 2,
    );

    expect(text()).toContain("Data deleted");
    expect(text()).not.toContain("may still be running");
  });
});
