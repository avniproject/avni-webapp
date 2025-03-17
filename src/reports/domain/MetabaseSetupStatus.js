import _ from "lodash";

class MetabaseBatchJobStatus {
  status;
  createDateTime;
  endDateTime;
  exitMessage;
  exitCode;

  isRunning() {
    if (!this.createDateTime) return false;
    const tenMinutesInMs = 10 * 60 * 1000;
    const now = new Date();
    const timeSinceCreation = now - this.createDateTime;
    return this.status === "STARTED" && timeSinceCreation <= tenMinutesInMs;
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
  NotEnabled = "NotEnabled";
  NotSetup = "NotSetup";
  Setup = "Setup";
  EtlNotRun = "EtlNotRun";

  status;
  tearDownStatus;
  createQuestionOnlyStatus;
  setupStatus;

  static createUnknownStatus() {
    const metabaseSetupStatus = new MetabaseSetupStatus();
    metabaseSetupStatus.status = MetabaseSetupStatus.Unknown;
    metabaseSetupStatus.tearDownStatus = MetabaseBatchJobStatus.createUnknownStatus();
    metabaseSetupStatus.createQuestionOnlyStatus = MetabaseBatchJobStatus.createUnknownStatus();
    metabaseSetupStatus.setupStatus = MetabaseBatchJobStatus.createUnknownStatus();
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

    return metabaseSetupStatus;
  }

  canStartSetup() {
    return this.status === this.NotSetup && !this.isAnyJobInProgress();
  }

  isSetupInProgress() {
    return this.setupStatus.isRunning();
  }

  isSetupComplete() {
    return this.status === this.Setup;
  }

  isCreateQuestionInProgress() {
    return this.createQuestionOnlyStatus.isRunning();
  }

  isTearDownInProgress() {
    return this.tearDownStatus.isRunning();
  }

  isAnyJobInProgress() {
    return [this.tearDownStatus, this.createQuestionOnlyStatus, this.setupStatus].some(jobStatus => jobStatus.isRunning());
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
}

export default MetabaseSetupStatus;
