import { buildPath } from '@aerogear/apollo-voyager-tools'
import { NextFunction, Response } from 'express'
import { IncomingMessage } from 'http'
import Prometheus from 'prom-client'

interface ResponseWithVoyagerMetrics extends Response {
  requestStart: number
}

Prometheus.collectDefaultMetrics()

const resolverTimingMetric = new Prometheus.Histogram({
  name: 'resolver_timing_ms',
  help: 'Resolver response time in milliseconds',
  labelNames: ['datasource_type', 'operation_type', 'name']
})

const resolverRequestsMetric = new Prometheus.Counter({
  name: 'requests_resolved',
  help: 'Number of requests resolved by server',
  labelNames: ['datasource_type', 'operation_type', 'path']
})

const resolverRequestsTotalMetric = new Prometheus.Counter({
  name: 'requests_resolved_total',
  help: 'Number of requests resolved by server in total',
  labelNames: ['datasource_type', 'operation_type', 'path']
})

const serverResponseMetric = new Prometheus.Histogram({
  name: 'server_response_ms',
  help: 'Server response time in milliseconds',
  labelNames: ['request_type', 'error']
})

export function getMetrics (req: IncomingMessage, res: Response) {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())

  resolverTimingMetric.reset()
  resolverRequestsMetric.reset()
  serverResponseMetric.reset()
}

export function responseLoggingMetric (req: IncomingMessage, res: ResponseWithVoyagerMetrics, next: NextFunction) {
  const requestMethod = req.method as string

  res.requestStart = Date.now()

  res.on('finish', onResFinished)
  res.on('error', onResFinished)

  if (next) { next() }

  function onResFinished (err: any) {
    res.removeListener('error', onResFinished)
    res.removeListener('finish', onResFinished)
    const responseTime = Date.now() - res.requestStart

    const requestFailed = (err !== undefined || res.statusCode > 299)

    serverResponseMetric
      .labels(requestMethod, String(requestFailed))
      .observe(responseTime)
  }
}

export function updateResolverMetrics (resolverInfo: any, responseTime: number) {
  const {
    operation: {operation: resolverMappingType},
    fieldName: resolverMappingName,
    path: resolverWholePath,
    parentType: resolverParentType,
    dataSourceType
  } = resolverInfo

  resolverTimingMetric
    .labels(dataSourceType, resolverMappingType, resolverMappingName)
    .observe(responseTime)

  resolverRequestsMetric
    .labels(
      dataSourceType,
      resolverMappingType,
      `${resolverParentType}.${buildPath(resolverWholePath)}`
    )
    .inc(1)

  resolverRequestsTotalMetric
    .labels(
      dataSourceType,
      resolverMappingType,
      `${resolverParentType}.${buildPath(resolverWholePath)}`
    )
    .inc(1)
}
