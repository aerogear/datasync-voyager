export interface Metrics {
  updateResolverMetrics (success: boolean, context: any, resolverInfo: any, responseTime: number): void
  recordConflictMetrics(resolverInfo: any): void
}
