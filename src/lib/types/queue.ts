export interface QueueStatus {
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
}

export interface QueueJob {
    id: string;
    name: string;
    data: Record<string, unknown>;
    status: string;
    progress?: number;
    timestamp: number;
    processedOn?: number;
    finishedOn?: number;
    failedReason?: string;
}

export interface QueueUpdate {
    queue: string;
    jobId: string;
    status: string;
    timestamp: Date;
    [key: string]: unknown;
}

export interface QueueFilter {
    status?: string;
    start?: number;
    size?: number;
}
