import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,      // smtp.sendgrid.net
      port: Number(process.env.SMTP_PORT), // 587
      secure: false,
      auth: {
        user: process.env.SMTP_USER,    // apikey
        pass: process.env.SMTP_PASS,    // SG.xxxx
      },
    });

    this.transporter.verify((err) => {
      if (err) {
        this.logger.error("SMTP connection failed ❌", err);
      } else {
        this.logger.log("SMTP connection ready ✅");
      }
    });
  }

  async sendGenericMail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: { filename: string; path: string }[];
  }) {
    await this.transporter.sendMail({
      from: `"BoxxPilot" <${process.env.MAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
  }

  async sendSetPasswordEmail(email: string, name: string, link: string) {
    return this.sendGenericMail({
      to: email,
      subject: "Set your BoxxPilot password",
      html: `
        <h2>Hello ${name}</h2>
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
        <a href="${link}">Confirm Account</a>
      `,
    });
  }
}
