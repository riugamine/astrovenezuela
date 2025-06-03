#!/usr/bin/env node

/**
 * Secret Generator for Astro Venezuela
 * 
 * This script generates all the cryptographic secrets needed for the application.
 * Run this script to generate secrets for both development and production environments.
 */

const crypto = require('crypto');

console.log('🔐 Generating cryptographic secrets for Astro Venezuela\n');

// Generate different types of secrets
const secrets = {
  // OAuth state signing secret (64 bytes = 128 hex chars)
  oauthStateSecret: crypto.randomBytes(64).toString('hex'),
  
  // Session secret for general session management (64 bytes)
  sessionSecret: crypto.randomBytes(64).toString('hex'),
  
  // Encryption key for sensitive data (32 bytes = 256-bit encryption)
  encryptionKey: crypto.randomBytes(32).toString('hex'),
  
  // JWT secret for custom JWT signing (if needed)
  jwtSecret: crypto.randomBytes(64).toString('hex'),
  
  // API key for internal services (32 bytes)
  internalApiKey: crypto.randomBytes(32).toString('hex'),
  
  // Database encryption key (if using encrypted fields)
  dbEncryptionKey: crypto.randomBytes(32).toString('hex'),
};

console.log('📋 Copy these secrets to your environment files:\n');

console.log('🔧 DEVELOPMENT ENVIRONMENT (.env.local)');
console.log('=====================================');
console.log(`OAUTH_STATE_SECRET=${secrets.oauthStateSecret}`);
console.log(`SESSION_SECRET=${secrets.sessionSecret}`);
console.log(`ENCRYPTION_KEY=${secrets.encryptionKey}`);
console.log(`JWT_SECRET=${secrets.jwtSecret}`);
console.log(`INTERNAL_API_KEY=${secrets.internalApiKey}`);
console.log(`DB_ENCRYPTION_KEY=${secrets.dbEncryptionKey}`);
console.log('');

// Generate different secrets for production
const productionSecrets = {
  oauthStateSecret: crypto.randomBytes(64).toString('hex'),
  sessionSecret: crypto.randomBytes(64).toString('hex'),
  encryptionKey: crypto.randomBytes(32).toString('hex'),
  jwtSecret: crypto.randomBytes(64).toString('hex'),
  internalApiKey: crypto.randomBytes(32).toString('hex'),
  dbEncryptionKey: crypto.randomBytes(32).toString('hex'),
};

console.log('🚀 PRODUCTION ENVIRONMENT (.env.production)');
console.log('==========================================');
console.log(`OAUTH_STATE_SECRET=${productionSecrets.oauthStateSecret}`);
console.log(`SESSION_SECRET=${productionSecrets.sessionSecret}`);
console.log(`ENCRYPTION_KEY=${productionSecrets.encryptionKey}`);
console.log(`JWT_SECRET=${productionSecrets.jwtSecret}`);
console.log(`INTERNAL_API_KEY=${productionSecrets.internalApiKey}`);
console.log(`DB_ENCRYPTION_KEY=${productionSecrets.dbEncryptionKey}`);
console.log('');

console.log('⚠️  SECURITY NOTES:');
console.log('================');
console.log('1. NEVER commit these secrets to version control');
console.log('2. Use different secrets for development and production');
console.log('3. Store production secrets securely in your deployment platform');
console.log('4. Rotate secrets periodically in production');
console.log('5. Keep a secure backup of production secrets');
console.log('');

console.log('📝 NEXT STEPS:');
console.log('==============');
console.log('1. Copy the development secrets to your .env.local file');
console.log('2. Copy the production secrets to your deployment platform');
console.log('3. Configure OAuth URLs in Supabase and Google Console');
console.log('4. Test the authentication flow in both environments');
console.log('');

// Also generate some utility functions for verification
console.log('🔍 SECRET VERIFICATION:');
console.log('======================');
console.log('You can verify your secrets are properly loaded by checking:');
console.log('- OAUTH_STATE_SECRET length should be 128 characters');
console.log('- SESSION_SECRET length should be 128 characters');
console.log('- ENCRYPTION_KEY length should be 64 characters');
console.log('- All secrets should be different between environments');
console.log('');

console.log('🎯 TESTING COMMAND:');
console.log('==================');
console.log('Run this in your Next.js app to verify secrets are loaded:');
console.log('');
console.log('node -e "');
console.log('  console.log(\\"OAUTH_STATE_SECRET length:\\", process.env.OAUTH_STATE_SECRET?.length);');
console.log('  console.log(\\"SESSION_SECRET length:\\", process.env.SESSION_SECRET?.length);');
console.log('  console.log(\\"ENCRYPTION_KEY length:\\", process.env.ENCRYPTION_KEY?.length);');
console.log('"');
console.log('');

console.log('✅ Secret generation complete!');
console.log('Remember to keep these secrets secure and never share them publicly.'); 