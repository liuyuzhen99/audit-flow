import { fetchValidatedJson } from "@/lib/api/fetcher";
import { phase9CutoverReadinessResponseDtoSchema } from "@/lib/schemas/phase9";
import type { Phase9CutoverReadinessResponseDto } from "@/types/phase9";

type GetPhase9CutoverReadinessOptions = {
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export async function getPhase9CutoverReadiness({
  baseUrl = "",
  fetcher,
}: GetPhase9CutoverReadinessOptions = {}): Promise<Phase9CutoverReadinessResponseDto> {
  return fetchValidatedJson({
    fetcher,
    input: `${baseUrl}/api/phase9/cutover-readiness`,
    init: { cache: "no-store" },
    schema: phase9CutoverReadinessResponseDtoSchema,
  });
}
