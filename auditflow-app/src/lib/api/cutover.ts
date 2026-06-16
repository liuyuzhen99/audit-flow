import { fetchValidatedJson } from "@/lib/api/fetcher";
import { cutoverReadinessResponseDtoSchema } from "@/lib/schemas/cutover";
import type { CutoverReadinessResponseDto } from "@/types/cutover";

type GetCutoverReadinessOptions = {
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export async function getCutoverReadiness({
  baseUrl = "",
  fetcher,
}: GetCutoverReadinessOptions = {}): Promise<CutoverReadinessResponseDto> {
  return fetchValidatedJson({
    fetcher,
    input: `${baseUrl}/api/cutover/readiness`,
    init: { cache: "no-store" },
    schema: cutoverReadinessResponseDtoSchema,
  });
}
