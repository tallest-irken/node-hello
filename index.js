import * as telemetry from './telemetry.js';
import { SpanStatusCode, metrics, trace } from '@opentelemetry/api';
import * as http from 'http';

//const http = require('http');
const port = process.env.PORT || 3000;

const tracer = trace.getTracer('node-hello');
const meter = metrics.getMeter('node-hello');
const connGauge = meter.createGauge("connections");
const reqCounter = meter.createCounter("requests");
const rssGauge = meter.createGauge("memory.rss");

const server = http.createServer((req, res) => {
  reqCounter.add(1);

  return tracer.startActiveSpan('say-hello', async (span) => {
    try {
      res.statusCode = 200;
      const msg = 'Hello, Node! \n'
      res.end(msg);

      span.setStatus({ code: SpanStatusCode.OK });
    } finally {
      span.end();
    }
  });
});

setInterval(() => {
  server.getConnections((err, count) => {
    if(err == null) {
      connGauge.record(count);
    }
  });

  const memoryUsage = process.memoryUsage();
  rssGauge.record(memoryUsage.rss);

}, 10000);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);

  for(var i = 0; i < 40000; i++) {
    console.log('spam test message ' + i);
  }
});
