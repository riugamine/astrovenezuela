#!/usr/bin/env node

/**
 * Environment Setup Guide for Astro Venezuela
 * This script helps you set up your environment variables correctly
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🚀 Astro Venezuela Environment Setup');
console.log('====================================\n');

// Generate secrets
function generateSecrets() {
  return {
    oauthSecret: crypto.randomBytes(32).toString('hex'),
    sessionSecret: crypto.randomBytes(64).toString('hex'),
    encryptionKey: crypto.randomBytes(32).toString('hex'),
  };
}

const devSecrets = generateSecrets();
const prodSecrets = generateSecrets();

console.log('🔐 STEP 1: Generated Cryptographic Secrets');
console.log('==========================================\n');

console.log('📝 FOR DEVELOPMENT (.env.local):');
console.log(`OAUTH_STATE_SECRET=${devSecrets.oauthSecret}`);
console.log(`SESSION_SECRET=${devSecrets.sessionSecret}`);
console.log(`ENCRYPTION_KEY=${devSecrets.encryptionKey}\n`);

console.log('🏭 FOR PRODUCTION:');
console.log(`OAUTH_STATE_SECRET=${prodSecrets.oauthSecret}`);
console.log(`SESSION_SECRET=${prodSecrets.sessionSecret}`);
console.log(`ENCRYPTION_KEY=${prodSecrets.encryptionKey}\n`);

console.log('⚙️  STEP 2: Supabase Configuration');
console.log('=================================\n');

console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
console.log('2. Navigate to Settings > API');
console.log('3. Copy these values to your environment files:');
console.log('   - Project URL (NEXT_PUBLIC_SUPABASE_URL)');
console.log('   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)');
console.log('   - service_role key (SUPABASE_SERVICE_ROLE_KEY)\n');

console.log('🔗 STEP 3: OAuth Configuration');
console.log('==============================\n');

console.log('A. In Supabase Dashboard:');
console.log('   1. Go to Authentication > Providers');
console.log('   2. Enable Google provider');
console.log('   3. Set Site URL:');
console.log('      - Development: http://localhost:3000');
console.log('      - Production: https://www.astrovenezuela.com');
console.log('   4. Set Redirect URLs:');
console.log('      - Development: http://localhost:3000/auth/callback');
console.log('      - Production: https://www.astrovenezuela.com/auth/callback\n');

console.log('B. In Google Cloud Console:');
console.log('   1. Go to: https://console.cloud.google.com');
console.log('   2. Create OAuth 2.0 credentials');
console.log('   3. Set Authorized redirect URIs:');
console.log('      - http://localhost:3000/auth/callback (development)');
console.log('      - https://www.astrovenezuela.com/auth/callback (production)');
console.log('   4. Copy Client ID and Secret to Supabase Google provider settings\n');

console.log('📁 STEP 4: Environment Files');
console.log('============================\n');

console.log('Create these files in your project root:\n');

// Create development environment content
const devEnvContent = `# Development Environment - Copy to .env.local
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (get from dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Generated secrets
OAUTH_STATE_SECRET=${devSecrets.oauthSecret}
SESSION_SECRET=${devSecrets.sessionSecret}
ENCRYPTION_KEY=${devSecrets.encryptionKey}

# Optional services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
STRIPE_PUBLIC_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_key

# Development settings
DEBUG_MODE=true
LOGGING_LEVEL=debug
`;

// Create production environment content
const prodEnvContent = `# Production Environment - Use in deployment platform
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.astrovenezuela.com

# Supabase (production project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Generated production secrets
OAUTH_STATE_SECRET=${prodSecrets.oauthSecret}
SESSION_SECRET=${prodSecrets.sessionSecret}
ENCRYPTION_KEY=${prodSecrets.encryptionKey}

# Production services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
STRIPE_PUBLIC_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key

# Production settings
DEBUG_MODE=false
LOGGING_LEVEL=error
`;

// Try to write the files
try {
  fs.writeFileSync('env.development.example', devEnvContent);
  fs.writeFileSync('env.production.example', prodEnvContent);
  console.log('✅ Created example environment files:');
  console.log('   - env.development.example (copy to .env.local)');
  console.log('   - env.production.example (use for deployment)\n');
} catch (error) {
  console.log('📄 Manual file creation needed - copy the content below:\n');
}

console.log('🧪 STEP 5: Testing');
console.log('==================\n');

console.log('Development testing:');
console.log('1. Copy env.development.example to .env.local');
console.log('2. Fill in your Supabase credentials');
console.log('3. Run: npm run dev');
console.log('4. Visit: http://localhost:3000/auth');
console.log('5. Test Google OAuth login\n');

console.log('Production testing:');
console.log('1. Deploy with production environment variables');
console.log('2. Visit: https://www.astrovenezuela.com/auth');
console.log('3. Test Google OAuth login\n');

console.log('🔍 STEP 6: Verification');
console.log('=======================\n');

console.log('Run this command to verify your environment is loaded correctly:');
console.log('node -e "console.log({');
console.log('  oauthSecret: process.env.OAUTH_STATE_SECRET?.length,');
console.log('  sessionSecret: process.env.SESSION_SECRET?.length,');
console.log('  encryptionKey: process.env.ENCRYPTION_KEY?.length,');
console.log('  supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,');
console.log('  supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('})"');
console.log('');

console.log('Expected output:');
console.log('{ oauthSecret: 64, sessionSecret: 128, encryptionKey: 64, supabaseUrl: true, supabaseKey: true }\n');

console.log('⚠️  SECURITY REMINDERS:');
console.log('======================');
console.log('❌ NEVER commit .env files to Git');
console.log('✅ Use different secrets for dev/prod');
console.log('✅ Store production secrets securely');
console.log('✅ Rotate secrets periodically');
console.log('✅ Enable 2FA on all service accounts\n');

console.log('🎉 Setup complete! You\'re ready to implement secure OAuth authentication.');
console.log('Need help? Check docs/environment-setup.md for detailed instructions.'); 