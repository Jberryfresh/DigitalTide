import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.app.env === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DigitalTide API is running',
    version: config.app.apiVersion,
    environment: config.app.env,
    timestamp: new Date().toISOString(),
  });
});

// API routes (to be implemented)
app.get(`/api/${config.app.apiVersion}`, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to DigitalTide API',
    version: config.app.apiVersion,
    documentation: `${config.app.url}/api-docs`,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(config.app.env === 'development' && { stack: err.stack }),
    },
  });
});

// Start server
const PORT = config.app.port;

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                      DIGITALTIDE                           ║');
  console.log('║        AI-Powered Autonomous News Platform                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running in ${config.app.env} mode`);
  console.log(`📡 API listening on: ${config.app.url}`);
  console.log(`📚 API Version: ${config.app.apiVersion}`);
  console.log(`🏥 Health check: ${config.app.url}/health`);
  if (config.features.apiDocs) {
    console.log(`📖 API Docs: ${config.app.url}/api-docs`);
  }
  console.log('');
  console.log('✅ AI Agents Status:');
  console.log(`   ${config.agents.coo.enabled ? '✓' : '✗'} COO Orchestrator`);
  console.log(`   ${config.agents.crawler.enabled ? '✓' : '✗'} Crawler Agent`);
  console.log(`   ${config.agents.research.enabled ? '✓' : '✗'} Research Agent`);
  console.log(`   ${config.agents.writer.enabled ? '✓' : '✗'} Writer Agent`);
  console.log(`   ${config.agents.qualityControl.enabled ? '✓' : '✗'} Quality Control Agent`);
  console.log(`   ${config.agents.seo.enabled ? '✓' : '✗'} SEO Agent`);
  console.log(`   ${config.agents.publisher.enabled ? '✓' : '✗'} Publisher Agent`);
  console.log(`   ${config.agents.analytics.enabled ? '✓' : '✗'} Analytics Agent`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('════════════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;