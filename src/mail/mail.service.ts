import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

export interface GenericMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    this.logger.log('SendGrid initialized ✅');
  }

  async sendGenericMail(options: GenericMailOptions) {
    await sgMail.send({
      to: options.to,
      from: process.env.MAIL_FROM!,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
  }

  async sendSetPasswordEmail(email: string, name: string, link: string) {
    return this.sendGenericMail({
      to: email,
      subject: 'Set your BoxxPilot password',
      html: `
        <h2>Hello ${name}</h2>
        <a href="${link}">Set Password</a>
      `,
    });
  }

  async sendEmployeeConfirmation(email: string, name: string, link: string) {
    return this.sendGenericMail({
      to: email,
      subject: 'Confirm your employment – BoxxPilot',
      html: `
        <h2>Welcome ${name}</h2>
        <a href="${link}">Confirm Account</a>
      `,
    });
  }
}
