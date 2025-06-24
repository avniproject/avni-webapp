import _ from "lodash";

class MetabaseBatchJobStatus {
  status;
  createDateTime;
  endDateTime;
  exitMessage;
  exitCode;

  isRunning(timeOut) {
    if (!this.createDateTime) return false;
    const now = new Date();
    const timeSinceCreation = now - this.createDateTime;
    return this.status === "STARTED" && timeSinceCreation <= timeOut;
  }

  static createFromResponse(batchJobResponse) {
    const metabaseBatchJobStatus = new MetabaseBatchJobStatus();
    metabaseBatchJobStatus.status = batchJobResponse.status;
    metabaseBatchJobStatus.createDateTime = new Date(batchJobResponse.createDateTime);
    metabaseBatchJobStatus.endDateTime = new Date(batchJobResponse.endDateTime);
    metabaseBatchJobStatus.exitMessage = batchJobResponse.exitMessage;
    metabaseBatchJobStatus.exitCode = batchJobResponse.exitCode;
    return metabaseBatchJobStatus;
  }

  static createUnknownStatus() {
    const metabaseBatchJobStatus = new MetabaseBatchJobStatus();
    metabaseBatchJobStatus.status = "Unknown";
    return metabaseBatchJobStatus;
  }
}

class MetabaseSetupStatus {
  static Unknown = "Unknown";
  static NotEnabled = "NotEnabled";
  static NotSetup = "NotSetup";
  static Setup = "Setup";
  static EtlNotRun = "EtlNotRun";

  status;
  tearDownStatus;
  createQuestionOnlyStatus;
  setupStatus;
  avniEnvironment;
  resources;
  timeoutInMillis;

  static createUnknownStatus() {
    const metabaseSetupStatus = new MetabaseSetupStatus();
    metabaseSetupStatus.status = MetabaseSetupStatus.Unknown;
    metabaseSetupStatus.tearDownStatus = MetabaseBatchJobStatus.createUnknownStatus();
    metabaseSetupStatus.createQuestionOnlyStatus = MetabaseBatchJobStatus.createUnknownStatus();
    metabaseSetupStatus.setupStatus = MetabaseBatchJobStatus.createUnknownStatus();
    metabaseSetupStatus.resources = [];
    metabaseSetupStatus.timeoutInMillis = 0;
    return metabaseSetupStatus;
  }

  static fromStatusResponse(statusResponse) {
    const metabaseSetupStatus = new MetabaseSetupStatus();
    metabaseSetupStatus.status = statusResponse.status;

    metabaseSetupStatus.tearDownStatus = MetabaseBatchJobStatus.createFromResponse(statusResponse.jobStatuses["TearDown"]);
    metabaseSetupStatus.createQuestionOnlyStatus = MetabaseBatchJobStatus.createFromResponse(
      statusResponse.jobStatuses["CreateQuestionOnly"]
    );
    metabaseSetupStatus.setupStatus = MetabaseBatchJobStatus.createFromResponse(statusResponse.jobStatuses["Setup"]);
    metabaseSetupStatus.avniEnvironment = statusResponse.avniEnvironment;
    metabaseSetupStatus.resources = statusResponse.resources;
    metabaseSetupStatus.timeoutInMillis = statusResponse.timeoutInMillis;
    return metabaseSetupStatus;
  }

  canStartSetup() {
    return (this.status === MetabaseSetupStatus.NotSetup || this.setupStatus.status !== "COMPLETED") && !this.isAnyJobInProgress();
  }

  isSetupInProgress() {
    return this.setupStatus.isRunning(this.timeoutInMillis);
  }

  isSetupComplete() {
    return this.status === MetabaseSetupStatus.Setup && this.setupStatus.status === "COMPLETED";
  }

  isAnyJobInProgress() {
    return [this.tearDownStatus, this.createQuestionOnlyStatus, this.setupStatus].some(jobStatus =>
      jobStatus.isRunning(this.timeoutInMillis)
    );
  }

  hasErrorMessage() {
    if (this.isAnyJobInProgress()) return false;
    const recentJobStatus = _.maxBy(
      [this.tearDownStatus, this.createQuestionOnlyStatus, this.setupStatus],
      jobStatus => jobStatus.endDateTime
    );
    return recentJobStatus.status === "FAILED";
  }

  getErrorMessage() {
    if (!this.hasErrorMessage()) return null;
    const recentJobStatus = _.maxBy(
      [this.tearDownStatus, this.createQuestionOnlyStatus, this.setupStatus],
      jobStatus => jobStatus.endDateTime
    );
    return recentJobStatus.exitMessage;
  }

  getShortErrorMessage() {
    const errorMessage = this.getErrorMessage();
    if (!errorMessage) return null;
    return errorMessage.length > 100 ? errorMessage.substring(0, 100) + "..." : errorMessage;
  }

  getExpectedDurationInMinutes() {
    return Math.round(this.timeoutInMillis / (1000 * 60));
  }
}

export default MetabaseSetupStatus;
