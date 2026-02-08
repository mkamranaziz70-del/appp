import { Injectable, Logger } from "@nestjs/common";
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import * as fs from "fs";

type MailAttachment = {
  filename: string;
  path: string; // local file path
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      this.logger.error("❌ SENDGRID_API_KEY is missing");
      return;
    }

    sgMail.setApiKey(apiKey);
    this.logger.log("✅ SendGrid Mail Service initialized");
  }

  async sendGenericMail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: MailAttachment[];
  }) {
    try {
      const msg: MailDataRequired = {
        to: options.to,
        from: {
          email: process.env.MAIL_FROM!,
          name: "BoxxPilot",
        },
        subject: options.subject,
        html: options.html,
      };

      // ✅ Attachments support
      if (options.attachments?.length) {
        msg.attachments = options.attachments.map((att) => ({
          filename: att.filename,
          content: fs.readFileSync(att.path).toString("base64"),
          disposition: "attachment",
        }));
      }

      await sgMail.send(msg);

      this.logger.log(`📧 Email sent to ${options.to}`);
    } catch (error: any) {
      this.logger.error("❌ Email send failed");

      if (error?.response?.body) {
        this.logger.error(JSON.stringify(error.response.body, null, 2));
      } else {
        this.logger.error(error);
      }

      throw error;
    }
  }

  async sendSetPasswordEmail(email: string, name: string, link: string) {
    return this.sendGenericMail({
      to: email,
      subject: "Set your BoxxPilot password",
      html: `
        <h2>Hello ${name}</h2>
        <p>Click below to set your password:</p>
        <a href="${link}">Set Password</a>
      `,
    });
  }

  async sendEmployeeConfirmation(email: string, name: string, link: string) {
    return this.sendGenericMail({
      to: email,
      subject: "Confirm your employment – BoxxPilot",
      html: `
        <h2>Welcome ${name}</h2>
        <p>Please confirm your account:</p>
        <a href="${link}">Confirm Account</a>
      `,
    });
  }
}
