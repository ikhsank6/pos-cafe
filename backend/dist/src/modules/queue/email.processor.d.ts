import type { Job } from 'bull';
import { EmailService } from '../email/email.service';
export interface VerificationEmailJob {
    email: string;
    name: string;
    verificationToken: string;
    createdAt?: string;
    temporaryPassword?: string;
}
export interface ResetPasswordEmailJob {
    email: string;
    name: string;
    resetToken: string;
}
export declare class EmailProcessor {
    private readonly emailService;
    private readonly logger;
    constructor(emailService: EmailService);
    handleVerificationEmail(job: Job<VerificationEmailJob>): Promise<void>;
    handleResetPasswordEmail(job: Job<ResetPasswordEmailJob>): Promise<void>;
}
