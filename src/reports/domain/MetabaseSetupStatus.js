import _ from "lodash";

class MetabaseBatchJobStatus {
  status;
  createDateTime;
  endDateTime;
  exitMessage;
  exitCode;
  syncStatus;

  static createFromResponse(batchJobResponse) {
    const metabaseBatchJobStatus = new MetabaseBatchJobStatus();
    metabaseBatchJobStatus.status = batchJobResponse.status;
    metabaseBatchJobStatus.createDateTime = new Date(batchJobResponse.createDateTime);
    metabaseBatchJobStatus.endDateTime = new Date(batchJobResponse.endDateTime);
    metabaseBatchJobStatus.exitMessage = batchJobResponse.exitMessage;
    metabaseBatchJobStatus.exitCode = batchJobResponse.exitCode;
    metabaseBatchJobStatus.syncStatus = batchJobResponse.syncStatus || null;
    return metabaseBatchJobStatus;
  }

  static createUnknownStatus() {
    const metabaseBatchJobStatus = new MetabaseBatchJobStatus();
    metabaseBatchJobStatus.status = "Unknown";
    return metabaseBatchJobStatus;
  }

  isRunning() {
    if (!this.createDateTime) return false;
    const tenMinutesInMs = 10 * 60 * 1000;
    const now = new Date();
    const timeSinceCreation = now - this.createDateTime;
    return this.status === "STARTED" && timeSinceCreation <= tenMinutesInMs;
  }
}

class MetabaseSetupStatus {
  static Unknown = "Unknown";
  NotEnabled = "NotEnabled";
  NotSetup = "NotSetup";
  Setup = "Setup";
  EtlNotRun = "EtlNotRun";
  // Sync status constants
  static SyncStatusTimedOut = "TimedOut";
  static SyncStatusAwaitingCompletion = "AwaitingManualSchemaSyncCompletion";
  static SyncStatusComplete = "Complete";
  AwaitingManualSchemaSyncCompletion = "AwaitingManualSchemaSyncCompletion";
  TimedOut = "TimedOut";

  status;
  tearDownStatus;
  createQuestionOnlyStatus;
  setupStatus;
  syncStatus;

  static createUnknownStatus() {
    const metabaseSetupStatus = new MetabaseSetupStatus();
    metabaseSetupStatus.status = MetabaseSetupStatus.Unknown;
    metabaseSetupStatus.tearDownStatus = MetabaseBatchJobStatus.createUnknownStatus();
    metabaseSetupStatus.createQuestionOnlyStatus = MetabaseBatchJobStatus.createUnknownStatus();
    metabaseSetupStatus.setupStatus = MetabaseBatchJobStatus.createUnknownStatus();
    metabaseSetupStatus.syncStatus = null;
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

    // Set the sync status if it exists in the response
    if (statusResponse.metabaseSyncStatus) {
      metabaseSetupStatus.syncStatus = statusResponse.metabaseSyncStatus;
    }

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

  isAnyJobInProgress() {
    return [this.tearDownStatus, this.createQuestionOnlyStatus, this.setupStatus].some(jobStatus => jobStatus.isRunning());
  }

  hasErrorMessage() {
    if (this.isAnyJobInProgress()) return false;
    // Don't show error message if it's a timeout - we'll show a dedicated message for that
    if (this.hasTimedOut()) return false;

    const recentJobStatus = _.maxBy(
      [this.tearDownStatus, this.createQuestionOnlyStatus, this.setupStatus].filter(job => job && job.endDateTime),
      jobStatus => jobStatus.endDateTime
    );

    // Check if we have a valid job status before checking its status
    return recentJobStatus && recentJobStatus.status === "FAILED";
  }

  getErrorMessage() {
    if (!this.hasErrorMessage()) return null;

    // Handle timeout case first
    if (this.hasTimedOut()) {
      return "Setup was abandoned mid-way due to timeout while awaiting Metabase schema sync completion";
    }

    // Get the most recent job status with a valid endDateTime
    const recentJobStatus = _.maxBy(
      [this.tearDownStatus, this.createQuestionOnlyStatus, this.setupStatus].filter(job => job && job.endDateTime),
      jobStatus => jobStatus.endDateTime
    );

    // Return the exit message if we have a valid job status
    return recentJobStatus && recentJobStatus.exitMessage ? recentJobStatus.exitMessage : "Unknown error";
  }

  hasTimedOut() {
    // Only return true if we explicitly have a TimedOut status
    return this.syncStatus === MetabaseSetupStatus.SyncStatusTimedOut;
  }

  isAwaitingManualSchemaSyncCompletion() {
    return this.syncStatus === MetabaseSetupStatus.SyncStatusAwaitingCompletion;
  }

  getShortErrorMessage() {
    const errorMessage = this.getErrorMessage();
    if (!errorMessage) return null;
    return errorMessage.length > 100 ? errorMessage.substring(0, 100) + "..." : errorMessage;
  }
}

export default MetabaseSetupStatus;
