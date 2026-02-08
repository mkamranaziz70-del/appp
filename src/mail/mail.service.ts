import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

export interface GenericMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendGenericMail(options: GenericMailOptions) {
    try {
      await sgMail.send({
        to: options.to,
        from: process.env.MAIL_FROM!,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`✅ Email sent to ${options.to}`);
    } catch (err: any) {
      this.logger.error('❌ SendGrid email failed');
      this.logger.error(err?.response?.body || err.message);
      throw err;
    }
  }
}
