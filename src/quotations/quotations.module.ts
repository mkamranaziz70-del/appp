import { Module } from "@nestjs/common";
import { QuotationsController } from "./quotations.controller";
import { QuotationsService } from "./quotations.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { PdfService } from "../pdf/pdf.service"; // 👈 ADD THIS
import { MailService } from "../mail/mail.service";

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    QuotationsController,
  ],
  providers: [
    QuotationsService,
    PdfService,          // 👈 REGISTER HERE
    MailService
  ],
  exports: [
    QuotationsService,
  ],
})
export class QuotationsModule {}
