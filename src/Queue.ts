import { Job } from './types';

export class Queue {

	private promise?: Promise<void>;
	private readonly jobs: {[key: string]: Job} = {};
	private readonly onEmptyQueue: () => any;

	constructor(onEmptyQueue: () => any = () => {}) {
		this.onEmptyQueue = onEmptyQueue;
	}

	public appendJob(jobId: string, job: Job): void {
		this.jobs[jobId] = job;

		if (this.promise === undefined) {
			this.promise = new Promise(async (resolve, reject) => {
				while (true) {
					const jobIds = Object.keys(this.jobs);
					if (jobIds.length === 0) {
						this.promise = undefined;
						resolve();
						return;
					}

					const currentJob = this.jobs[jobIds[0]];

					try {
						await currentJob();
					} catch (e) {
						reject(e);
					}

					delete this.jobs[jobIds[0]];
				}
			}).then(this.onEmptyQueue);
		}
	}

}