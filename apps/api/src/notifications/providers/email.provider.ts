import { Injectable, Logger } from '@nestjs/common';

export type EmailMessage = { to: string; subject: string; html: string };

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  async send(message: EmailMessage) {
    // Development adapter. Replace with SES, SendGrid, Postmark, or SMTP in production.
    this.logger.log(`Email queued for ${message.to}: ${message.subject}`);
    return { provider: 'console', messageId: `console-${Date.now()}` };
  }
}
