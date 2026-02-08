import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { JobStatus, NotificationType } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class JobsCronService {
  private readonly logger = new Logger(JobsCronService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  @Cron("* * * * *")
  async superviseJobs() {
    const now = new Date();
    this.logger.debug("⏱️ Running jobs supervisor cron...");

    const missedJobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.CONFIRMED,
        quotation: {
          endAt: { lt: now },
        },
      },
      include: {
        quotation: true,
        employees: true,
      },
    });

    for (const job of missedJobs) {
      await this.prisma.$transaction(async tx => {
        await tx.job.update({
          where: { id: job.id },
          data: { status: JobStatus.MISSED },
        });
      });

      this.logger.warn(
        ` Job #${job.jobNumber} marked MISSED (never started)`
      );

      for (const e of job.employees) {
        await this.notificationsService.createEmployeeNotification({
          employeeId: e.employeeId,
          companyId: job.companyId,
          title: "Job Missed",
          message: `Job #${job.jobNumber} was missed (not started on time)`,
          type: NotificationType.JOB_MISSED,
          jobId: job.id,
        });

     

        
      }
    }

    const autoEndJobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.IN_PROGRESS,
        quotation: {
          endAt: { lt: now },
        },
      },
      include: {
        quotation: true,
        employees: true,
      },
    });

    for (const job of autoEndJobs) {
      const endTime = job.quotation?.endAt ?? now;

      await this.prisma.$transaction(async tx => {
        await tx.job.update({
          where: { id: job.id },
          data: {
            status: JobStatus.AUTO_ENDED,
            endedAt: endTime,
          },
        });

        await tx.punch.updateMany({
          where: {
            jobId: job.id,
            punchOut: null,
          },
          data: {
            punchOut: endTime,
            punchOutType: "AUTO",
          },
        });
      });

      this.logger.warn(
        `⏹️ Job #${job.jobNumber} AUTO_ENDED (employee forgot to end)`
      );

      for (const e of job.employees) {
        await this.notificationsService.createEmployeeNotification({
          employeeId: e.employeeId,
          companyId: job.companyId,
          title: "Job Auto Ended",
          message: `Job #${job.jobNumber} was automatically ended`,
          type: NotificationType.JOB_AUTO_ENDED,
          jobId: job.id,
        });



      }
    }
  }
}
