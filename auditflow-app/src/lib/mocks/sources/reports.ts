import { reportDetailResponseDtoSchema } from "@/lib/schemas/report";
import { MOCK_GENERATED_AT } from "@/lib/mocks/data/common";
import { reportSeedRecords } from "@/lib/mocks/data/reports";
import type { ReportDetailResponseDto } from "@/types/audit-report";

export function getReportDetailResponse(reportId: string): ReportDetailResponseDto {
  const report = reportSeedRecords.find((item) => item.id === reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  return reportDetailResponseDtoSchema.parse({
    report,
    meta: {
      generatedAt: MOCK_GENERATED_AT,
    },
  });
}
