/**
 * Environment variables diagnostic function
 * This helps identify missing or incorrect environment variables
 */
export function checkEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars: string[] = [];
  const presentVars: string[] = [];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else {
      presentVars.push(varName);
    }
  });

  return {
    missing: missingVars,
    present: presentVars,
    allPresent: missingVars.length === 0
  };
}

/**
 * Log environment status for debugging
 */
export function logEnvironmentStatus() {
  const status = checkEnvironmentVariables();
  
  console.log('=== Environment Variables Status ===');
  console.log('Present variables:', status.present);
  
  if (status.missing.length > 0) {
    console.error('Missing variables:', status.missing);
  } else {
    console.log('✅ All required environment variables are present');
  }
  
  return status;
}
