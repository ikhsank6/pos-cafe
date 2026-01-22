import { ConfigService } from '@nestjs/config';
export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export interface VerificationEmailData {
    email: string;
    name: string;
    verificationToken: string;
    createdAt?: Date;
}
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendEmail(options: SendEmailOptions): Promise<boolean>;
    private formatDate;
    private getHtmlTemplate;
    sendVerificationEmail(email: string, name: string, verificationToken: string, createdAt?: Date, temporaryPassword?: string): Promise<boolean>;
    sendResetPasswordEmail(email: string, name: string, resetToken: string): Promise<boolean>;
}
