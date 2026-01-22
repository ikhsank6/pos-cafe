import type { Queue } from 'bull';
import { VerificationEmailJob, ResetPasswordEmailJob } from './email.processor';
export declare class QueueService {
    private emailQueue;
    private readonly logger;
    constructor(emailQueue: Queue);
    addVerificationEmailJob(data: VerificationEmailJob): Promise<void>;
    addResetPasswordEmailJob(data: ResetPasswordEmailJob): Promise<void>;
}
