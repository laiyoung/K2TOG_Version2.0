#!/usr/bin/env node

// Railway start script with enhanced error handling
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting YJ Child Care Plus Server...');
console.log('📅 Start time:', new Date().toISOString());
console.log('🔧 Node version:', process.version);
console.log('📁 Working directory:', process.cwd());

// Start the main application
const child = spawn('node', ['index.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Handle child process events
child.on('error', (error) => {
  console.error('❌ Failed to start child process:', error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  console.log(`📤 Child process exited with code ${code} and signal ${signal}`);
  
  // If it's a normal exit, don't restart
  if (code === 0) {
    console.log('✅ Server stopped normally');
    process.exit(0);
  }
  
  // If it's an error, restart after a delay
  console.log('🔄 Restarting server in 5 seconds...');
  setTimeout(() => {
    console.log('🔄 Restarting now...');
    process.exit(1); // This will trigger Railway to restart
  }, 5000);
});

// Handle parent process signals
process.on('SIGTERM', () => {
  console.log('📡 SIGTERM received, shutting down gracefully');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📡 SIGINT received, shutting down gracefully');
  child.kill('SIGINT');
});

// Keep parent process alive
setInterval(() => {
  console.log('💓 Parent process keep-alive:', new Date().toISOString());
}, 30000);
