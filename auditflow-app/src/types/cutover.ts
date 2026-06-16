export type CutoverGateDto = {
  name: string;
  passed: boolean;
  details: Record<string, unknown>;
};

export type CutoverReadinessReportDto = {
  generatedAt: string;
  readSource: string;
  stabilityWindowDays: number;
  readyForCutover: boolean;
  gates: CutoverGateDto[];
};

export type CutoverReadinessResponseDto = {
  report: CutoverReadinessReportDto;
};
