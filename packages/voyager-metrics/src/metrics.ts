import { buildPath } from '@aerogear/voyager-tools'
import { NextFunction, Response } from 'express'
import { Application } from 'express'
import { IncomingMessage } from 'http'
import Prometheus from 'prom-client'

import { MetricsConfiguration } from './api'

const resolverTimingMetric = new Prometheus.Histogram({
  name: 'resolver_timing_ms',
  help: 'Resolver response time in milliseconds',
  labelNames: ['operation_type', 'name']
})

const resolverRequestsMetric = new Prometheus.Counter({
  name: 'requests_resolved',
  help: 'Number of requests resolved by server',
  labelNames: ['operation_type', 'path', 'success', 'authenticated']
})

const resolverRequestsTotalMetric = new Prometheus.Counter({
  name: 'requests_resolved_total',
  help: 'Number of requests resolved by server in total',
  labelNames: ['operation_type', 'path', 'success', 'authenticated']
})

const serverResponseMetric = new Prometheus.Histogram({
  name: 'server_response_ms',
  help: 'Server response time in milliseconds',
  labelNames: ['request_type', 'error']
})

const conflictsMetric = new Prometheus.Counter({
  name: 'conflicts',
  help: 'Number of conflicts happened',
  labelNames: ['operation_type', 'name']
})

const uniqueClientsMetric = new Prometheus.Counter({
  name: 'unique_clients',
  help: 'Number of unique clients'
})

const uniqueUsersMetric = new Prometheus.Counter({
  name: 'unique_users',
  help: 'Number of unique users'
})

const uniqueClientIds = new Set()
const uniqueUserIds = new Set()

/**
 *
 * @param app
 * @param config
 */
export function applyMetricsMiddlewares (app: Application, config: MetricsConfiguration) {
  Prometheus.collectDefaultMetrics()
  app.use(responseLoggingMetric as (req: IncomingMessage, res: Response, next: NextFunction) => void)
  applyMetricsMiddleware(app, config)
}

export function updateResolverMetrics (success: boolean, context: any, resolverInfo: any, responseTime: number) {
  const {
    operation: {operation: resolverMappingType},
    fieldName: resolverMappingName,
    path: resolverWholePath,
    parentType: resolverParentType
  } = resolverInfo

  const clientInfo = context && context.request && context.request.body && context.request.body.extensions && context.request.body.extensions.metrics || undefined
  const authenticated = !!(context && context.auth && context.auth.isAuthenticated())
  const userInfo = (context && context.auth && context.auth.accessToken) ? context.auth.accessToken.content : undefined

  const clientId = clientInfo && clientInfo.clientId || 'UNKNOWN CLIENT ID'
  const userId = userInfo && userInfo.email || 'UNKNOWN USER ID'

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
      path,
      success + '',
      authenticated + ''
    )
    .inc(1)

  resolverRequestsTotalMetric
    .labels(
      resolverMappingType,
      path,
      success + '',
      authenticated + ''
    )
    .inc(1)

  if (!uniqueClientIds.has(clientId)) {
    uniqueClientIds.add(clientId)
    uniqueClientsMetric.inc(1)
  }

  if (!uniqueUserIds.has(userId)) {
    uniqueUserIds.add(userId)
    uniqueUsersMetric.inc(1)
  }

}

export function recordConflictMetrics(resolverInfo: any) {
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

  conflictsMetric
    .labels(
      resolverMappingType,
      path
    )
    .inc(1)
}

function applyMetricsMiddleware (app: Application, config: MetricsConfiguration) {
  const path = config && config.path ? config.path : '/metrics'
  app.get(path, getMetrics)
}

///////////////////////////////////////////////////////////////

function getMetrics (req: IncomingMessage, res: Response) {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())

  resolverTimingMetric.reset()
  resolverRequestsMetric.reset()
  serverResponseMetric.reset()
  conflictsMetric.reset()
  uniqueClientsMetric.reset()
  uniqueUsersMetric.reset()

  uniqueClientIds.clear()
  uniqueUserIds.clear()
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
