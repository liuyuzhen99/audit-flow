export type Phase9CutoverGateDto = {
  name: string;
  passed: boolean;
  details: Record<string, unknown>;
};

export type Phase9CutoverReadinessReportDto = {
  generatedAt: string;
  readSource: string;
  stabilityWindowDays: number;
  readyForCutover: boolean;
  gates: Phase9CutoverGateDto[];
};

export type Phase9CutoverReadinessResponseDto = {
  report: Phase9CutoverReadinessReportDto;
};
