import { Metrics } from './Metrics'

export class DefaultMetrics implements Metrics {
  public updateResolverMetrics (resolverInfo: any, responseTime: number): void {
    // no op
  }
  public recordConflictMetrics(resolverInfo: any): void {
    // no op
  }
}
