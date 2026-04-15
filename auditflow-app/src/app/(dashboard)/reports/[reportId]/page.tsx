import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ReportDetailClient } from "@/components/features/reports/report-detail-client";
import { adaptReportDetail } from "@/lib/adapters/reports";
import { getReportDetailResponse } from "@/lib/mocks/sources/reports";

type ReportPageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { reportId } = await params;
  const response = getExistingReportDetailResponse(reportId);
  const viewModel = adaptReportDetail(response.report);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          href="/queue"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Queue
        </Link>
      </div>

      <ReportDetailClient viewModel={viewModel} />
    </section>
  );
}

function getExistingReportDetailResponse(reportId: string) {
  try {
    return getReportDetailResponse(reportId);
  } catch (error) {
    if (error instanceof Error && error.message === "Report not found") {
      notFound();
    }

    throw error;
  }
}
