export interface TEmbryologistStats {
    totalAssessmentsToday: number;
    completedSemenAnalyses: number;
    pendingIVFAssessments: number;
    totalCryopreservedSamples: number;
    activeEmbryoTanks: number;
    averageAssessmentTime: number;
    successRate: number;
}

export type TEmbryologistDashboardData = {
    stats: TEmbryologistStats;
};
