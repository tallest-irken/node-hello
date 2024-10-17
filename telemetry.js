import { metrics } from '@opentelemetry/api'
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics'
import { Resource } from '@opentelemetry/resources'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { v4 as uuidv4 } from 'uuid';
import { hostname } from 'os';

const SERVICE_NAME = 'node-hello';

const resource = Resource.default().merge(
    new Resource({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      'service.id': uuidv4(),
      'service.namespace': 'tallest-irken',
      'deployment.environment.name': hostname().split('-' + SERVICE_NAME)[0],
    })
  )
  
  // Configure OTLP metrics exporter
  const otlpMetricsExporter = new OTLPMetricExporter({
    url: 'http://signoz-release-otel-collector.signoz:4318/v1/metrics', // ensure the port is correct
  })
  
  const metricReader = new PeriodicExportingMetricReader({
    exporter: otlpMetricsExporter,
  
    // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
    exportIntervalMillis: 10000,
  })
  
  // Initialize MeterProvider
  const myServiceMeterProvider = new MeterProvider({
    resource: resource,
    readers: [metricReader],
  })
  
  // Set this MeterProvider to be global to the app being instrumented.
  metrics.setGlobalMeterProvider(myServiceMeterProvider)