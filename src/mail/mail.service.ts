import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

/**
 * Generic mail options
 * (Invoices, PDFs, custom emails etc.)
 */
export interface GenericMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    path: string;
  }[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    /**
     * SendGrid SMTP configuration
     */
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,                 // smtp.sendgrid.net
      port: Number(process.env.SMTP_PORT),         // 587
      secure: false,                               // TLS
      auth: {
        user: process.env.SMTP_USER,               // "apikey"
        pass: process.env.SMTP_PASS,               // SG.xxxxx
      },
    });

    // Optional: verify SMTP on startup (recommended)
    this.transporter.verify(err => {
      if (err) {
        this.logger.error("SMTP connection failed", err);
      } else {
        this.logger.log("SMTP connection ready ✅");
      }
    });
  }

  // ======================================================
  // 🔹 GENERIC MAIL (Invoices, PDFs, custom notifications)
  // ======================================================
  async sendGenericMail(options: GenericMailOptions) {
    await this.transporter.sendMail({
      from: `"BoxxPilot" <${process.env.MAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
  }

  // ======================================================
  // 🔹 OWNER / USER PASSWORD SETUP
  // ======================================================
  async sendSetPasswordEmail(
    email: string,
    name: string,
    link: string
  ) {
    await this.transporter.sendMail({
      from: `"BoxxPilot" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: "Set your BoxxPilot password",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your account has been created successfully.</p>
        <p>Please set your password using the link below:</p>
        <a href="${link}" target="_blank">Set Password</a>
        <br/><br/>
        <small>If you didn’t request this, please ignore this email.</small>
      `,
    });
  }

  // ======================================================
  // 🔹 EMPLOYEE PASSWORD SETUP
  // ======================================================
  async sendEmployeePasswordSetup(
    email: string,
    name: string,
    link: string
  ) {
    await this.transporter.sendMail({
      from: `"BoxxPilot" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: "Set your password – BoxxPilot",
      html: `
        <h2>Hello ${name}</h2>
        <p>You have been added as an employee.</p>
        <p>Set your password using the link below:</p>
        <a href="${link}" target="_blank">Set Password</a>
      `,
    });
  }

  // ======================================================
  // 🔹 EMPLOYEE CONFIRMATION EMAIL
  // ======================================================
  async sendEmployeeConfirmation(
    email: string,
    name: string,
    link: string
  ) {
    await this.transporter.sendMail({
      from: `"BoxxPilot" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: "Confirm your employment – BoxxPilot",
      html: `
        <h2>Welcome ${name}</h2>
        <p>Please confirm your employment by clicking the link below:</p>
        <a href="${link}" target="_blank">Confirm Account</a>
      `,
    });
  }
}
