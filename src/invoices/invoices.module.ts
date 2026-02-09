// src/invoices/invoices.module.ts
import { Module } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";
import { InvoicesController } from "./invoices.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { PdfModule } from "../pdf/pdf.module";
import { MailModule } from "../mail/mail.module"; // ✅ ADD THIS

@Module({
  imports: [
    PrismaModule,
    PdfModule,
        MailModule, // 🔥 THIS LINE FIXES EVERYTHING

  ],
  controllers: [InvoicesController], // ✅ THIS FIXES ROUTES
  providers: [InvoicesService],
  exports: [InvoicesService], // ✅ needed for JobModule
})
export class InvoicesModule {}
