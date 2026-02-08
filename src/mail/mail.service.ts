import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,          // ✅ MUST
    port: Number(process.env.SMTP_PORT),  // ✅ MUST
    secure: false,                        // SendGrid = false
    auth: {
      user: process.env.SMTP_USER,        // apikey
      pass: process.env.SMTP_PASS,        // SG.xxxx
    },
  });

  async sendGenericMail(options: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.transporter.sendMail({
      from: `"BoxxPilot" <${process.env.MAIL_FROM}>`, // ✅ yahan from
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  async sendSetPasswordEmail(email: string, name: string, link: string) {
    await this.transporter.sendMail({
      from: `"BoxxPilot" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: "Set your BoxxPilot password",
      html: `
        <h2>Hello ${name}</h2>
        <a href="${link}">Set Password</a>
      `,
    });
  }
}
