
/**
 * Interface used to abstract conflict logging
 */
export interface MetricsAuditInformation {
  logMessage(message: string, tag?: string): void
}
