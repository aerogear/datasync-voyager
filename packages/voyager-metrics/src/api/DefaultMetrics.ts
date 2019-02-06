import { Metrics } from './Metrics'

export class DefaultMetrics implements Metrics {
  updateResolverMetrics (resolverInfo: any, responseTime: number): void {
    // no op
  }
  recordConflictMetrics(resolverInfo: any): void {
    // no op
  }
}