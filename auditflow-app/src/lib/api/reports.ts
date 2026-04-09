import { reportDetailResponseDtoSchema } from "@/lib/schemas/report";

import { fetchValidatedJson } from "@/lib/api/fetcher";

import type { ReportDetailResponseDto } from "@/types/audit-report";

export async function getReportDetail(options: {
  fetcher?: typeof fetch;
  reportId: string;
}): Promise<ReportDetailResponseDto> {
  const searchParams = new URLSearchParams({ id: options.reportId });

  return fetchValidatedJson({
    fetcher: options.fetcher,
    input: `/api/mock/reports?${searchParams.toString()}`,
    schema: reportDetailResponseDtoSchema,
  });
}
