export interface QueueStatus {
	name: string;
	waiting: number;
	active: number;
	completed: number;
	failed: number;
	delayed: number;
	paused: boolean;
}

export interface QueueUpdate {
	queue: string;
	jobId: string;
	status: string;
	timestamp: Date;
	[key: string]: unknown;
}
