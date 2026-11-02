/**
 * avni-webapp#1749: the program Active toggle did not persist. The admin save payload in
 * ProgramService.saveProgram omitted `active`, so the server (which honours
 * ProgramContract.active) never received the toggle's value and the program stayed active.
 * Fix: the payload carries `active: program.active`.
 */
import ProgramService from "./ProgramService";
import { httpClient as http } from "../../common/utils/httpClient";

jest.mock("../../common/utils/httpClient", () => ({
  httpClient: {
    post: jest.fn(() => Promise.resolve({ status: 200, data: { id: 1, programId: 11 } })),
    put: jest.fn(() => Promise.resolve({ status: 200, data: { id: 7, programId: 7 } })),
  },
}));

const subjectType = { uuid: "subject-type-uuid" };

beforeEach(() => {
  http.post.mockClear();
  http.put.mockClear();
});

describe("ProgramService.saveProgram sends the Active toggle (#1749)", () => {
  it("edit: disabling a program PUTs active=false", async () => {
    const program = { name: "Pregnancy", active: false, programId: 7 };
    await ProgramService.saveProgram(program, subjectType, 7);
    expect(http.put).toHaveBeenCalledTimes(1);
    const [endpoint, body] = http.put.mock.calls[0];
    expect(endpoint).toBe("/web/program/7");
    expect(body.active).toBe(false);
  });

  it("edit: enabling a program PUTs active=true", async () => {
    const program = { name: "Pregnancy", active: true, programId: 7 };
    await ProgramService.saveProgram(program, subjectType, 7);
    expect(http.put.mock.calls[0][1].active).toBe(true);
  });

  it("create: POSTs the program's active value", async () => {
    const program = { name: "New", active: true };
    await ProgramService.saveProgram(program, subjectType, null);
    expect(http.post).toHaveBeenCalledTimes(1);
    const [endpoint, body] = http.post.mock.calls[0];
    expect(endpoint).toBe("/web/program/");
    expect(body.active).toBe(true);
  });
});

describe("ProgramService trims the program name (avniproject/avni-client#1635)", () => {
  it("validate: an all-spaces name is refused as empty", () => {
    const [errors] = ProgramService.validateProgram({ name: "   " }, subjectType);
    expect(errors.get("Name")).toBe("Empty");
  });

  it("validate: a padded name is accepted", () => {
    const [errors] = ProgramService.validateProgram({ name: "  Pregnancy  " }, subjectType);
    expect(errors.has("Name")).toBe(false);
  });

  it("create: POSTs the trimmed name", async () => {
    await ProgramService.saveProgram({ name: "  Pregnancy  ", active: true }, subjectType, null);
    expect(http.post.mock.calls[0][1].name).toBe("Pregnancy");
  });

  it("edit: PUTs the trimmed name", async () => {
    await ProgramService.saveProgram({ name: " Pregnancy ", active: true, programId: 7 }, subjectType, 7);
    expect(http.put.mock.calls[0][1].name).toBe("Pregnancy");
  });
});
