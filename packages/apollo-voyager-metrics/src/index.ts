import { buildPath } from '@aerogear/apollo-voyager-tools'
import { NextFunction, Response } from 'express'
import { Application } from 'express'
import { IncomingMessage } from 'http'
import Prometheus from 'prom-client'

let promMetricsEnabled = false

const resolverTimingMetric = new Prometheus.Histogram({
  name: 'resolver_timing_ms',
  help: 'Resolver response time in milliseconds',
  labelNames: ['operation_type', 'name']
})

const resolverRequestsMetric = new Prometheus.Counter({
  name: 'requests_resolved',
  help: 'Number of requests resolved by server',
  labelNames: ['operation_type', 'path']
})

const resolverRequestsTotalMetric = new Prometheus.Counter({
  name: 'requests_resolved_total',
  help: 'Number of requests resolved by server in total',
  labelNames: ['operation_type', 'path']
})

const serverResponseMetric = new Prometheus.Histogram({
  name: 'server_response_ms',
  help: 'Server response time in milliseconds',
  labelNames: ['request_type', 'error']
})

export interface MetricsConfiguration {
  path: string
}

export function applyMetricsMiddlewares(app: Application, config: MetricsConfiguration) {
  enableDefaultMetricsCollection()
  applyResponseLoggingMetricsMiddleware(app)
  applyMetricsMiddleware(app, config)
}

function enableDefaultMetricsCollection () {
  if (!promMetricsEnabled) {
    Prometheus.collectDefaultMetrics()
    promMetricsEnabled = true
  }
}

function applyResponseLoggingMetricsMiddleware (app: Application) {
  app.use(responseLoggingMetric as (req: IncomingMessage, res: Response, next: NextFunction) => void)
}

function applyMetricsMiddleware (app: Application, config: MetricsConfiguration) {
  let path = config && config.path ? config.path : '/metrics'
  app.get(path, app)
}

function updateResolverMetrics (resolverInfo: any, responseTime: number) {
  const {
    operation: {operation: resolverMappingType},
    fieldName: resolverMappingName,
    path: resolverWholePath,
    parentType: resolverParentType
  } = resolverInfo

  let path
  if (resolverParentType.name === 'Query' || resolverParentType.name === 'Mutation' || resolverParentType.name === 'Subscription') {
    path = `${resolverParentType.name}.${buildPath(resolverWholePath)}`
  } else {
    path = buildPath(resolverWholePath)
  }

  resolverTimingMetric
    .labels(
      resolverMappingType,
      path
    )
    .observe(responseTime)

  resolverRequestsMetric
    .labels(
      resolverMappingType,
      path
    )
    .inc(1)

  resolverRequestsTotalMetric
    .labels(
      resolverMappingType,
      path
    )
    .inc(1)
}

///////////////////////////////////////////////////////////////

function getMetrics (req: IncomingMessage, res: Response) {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())

  resolverTimingMetric.reset()
  resolverRequestsMetric.reset()
  serverResponseMetric.reset()
}

interface ResponseWithVoyagerMetrics extends Response {
  requestStart: number
}

function responseLoggingMetric (req: IncomingMessage, res: ResponseWithVoyagerMetrics, next: NextFunction) {
  const requestMethod = req.method as string

  res = res as ResponseWithVoyagerMetrics

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
