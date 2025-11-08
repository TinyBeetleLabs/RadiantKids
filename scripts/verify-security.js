/**
 * Security Verification Script
 * 
 * Run this script to verify security configuration before deployment:
 * node scripts/verify-security.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Running Security Verification...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Verify .env.local exists (for production)
console.log('1️⃣  Checking environment configuration...');
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.log('   ⚠️  WARNING: .env.local file not found');
  console.log('   Create it with: cp .env.example .env.local');
  hasWarnings = true;
} else {
  console.log('   ✅ .env.local file exists');
  
  // Check if it contains required variables (don't read actual values for security)
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('USE_MOCK_DATA')) {
    console.log('   ❌ ERROR: USE_MOCK_DATA not defined');
    hasErrors = true;
  }
  
  if (envContent.includes('USE_MOCK_DATA=false')) {
    if (!envContent.includes('PCO_CLIENT_ID')) {
      console.log('   ❌ ERROR: PCO_CLIENT_ID not defined (required for live mode)');
      hasErrors = true;
    }
    
    if (!envContent.includes('PCO_CLIENT_SECRET')) {
      console.log('   ❌ ERROR: PCO_CLIENT_SECRET not defined (required for live mode)');
      hasErrors = true;
    }
  }
}

// Check 2: Verify .gitignore includes sensitive files
console.log('\n2️⃣  Checking .gitignore configuration...');
const gitignorePath = path.join(__dirname, '../.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  
  if (gitignore.includes('.env*.local') && gitignore.includes('.env')) {
    console.log('   ✅ .env files properly ignored');
  } else {
    console.log('   ❌ ERROR: .env files not properly ignored!');
    hasErrors = true;
  }
} else {
  console.log('   ❌ ERROR: .gitignore file not found!');
  hasErrors = true;
}

// Check 3: Verify security config files exist
console.log('\n3️⃣  Checking security configuration files...');
const securityConfigPath = path.join(__dirname, '../next.config.security.js');
if (fs.existsSync(securityConfigPath)) {
  console.log('   ✅ next.config.security.js exists');
} else {
  console.log('   ❌ ERROR: next.config.security.js not found!');
  hasErrors = true;
}

const middlewarePath = path.join(__dirname, '../middleware.ts');
if (fs.existsSync(middlewarePath)) {
  console.log('   ✅ middleware.ts exists');
} else {
  console.log('   ❌ ERROR: middleware.ts not found!');
  hasErrors = true;
}

// Check 4: Verify no localStorage/sessionStorage in code
console.log('\n4️⃣  Checking for client-side storage usage...');
const pagesDir = path.join(__dirname, '../pages');
const componentsDir = path.join(__dirname, '../components');

function checkForStorage(dir, dirName) {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  const files = fs.readdirSync(dir, { recursive: true });
  let foundStorage = false;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('localStorage') || content.includes('sessionStorage')) {
        console.log(`   ⚠️  WARNING: Found storage usage in ${dirName}/${file}`);
        foundStorage = true;
        hasWarnings = true;
      }
    }
  });
  
  if (!foundStorage) {
    console.log(`   ✅ No client-side storage in ${dirName}/`);
  }
}

checkForStorage(pagesDir, 'pages');
checkForStorage(componentsDir, 'components');

// Check 5: Verify API route security
console.log('\n5️⃣  Checking API route security...');
const apiRoutePath = path.join(__dirname, '../pages/api/checkins.ts');
if (fs.existsSync(apiRoutePath)) {
  const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
  
  if (apiContent.includes('no-store') && apiContent.includes('no-cache')) {
    console.log('   ✅ API cache headers configured');
  } else {
    console.log('   ⚠️  WARNING: API cache headers may be missing');
    hasWarnings = true;
  }
  
  if (apiContent.includes("req.method !== 'GET'")) {
    console.log('   ✅ API method restriction in place');
  } else {
    console.log('   ⚠️  WARNING: API method restriction not found');
    hasWarnings = true;
  }
} else {
  console.log('   ❌ ERROR: API route not found!');
  hasErrors = true;
}

// Check 6: Verify next.config.js includes security headers
console.log('\n6️⃣  Checking Next.js security configuration...');
const nextConfigPath = path.join(__dirname, '../next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (nextConfig.includes('securityHeaders')) {
    console.log('   ✅ Security headers configured in next.config.js');
  } else {
    console.log('   ❌ ERROR: Security headers not configured!');
    hasErrors = true;
  }
  
  if (nextConfig.includes('poweredByHeader: false')) {
    console.log('   ✅ Powered-by header disabled');
  } else {
    console.log('   ⚠️  WARNING: Powered-by header should be disabled');
    hasWarnings = true;
  }
} else {
  console.log('   ❌ ERROR: next.config.js not found!');
  hasErrors = true;
}

// Check 7: Verify no credentials in code
console.log('\n7️⃣  Scanning for hardcoded credentials...');
const srcDirs = ['pages', 'components', 'lib'];
let foundCredentials = false;

const dangerousPatterns = [
  /client_id\s*=\s*['"][^'"]+['"]/i,
  /client_secret\s*=\s*['"][^'"]+['"]/i,
  /api_key\s*=\s*['"][^'"]+['"]/i,
  /password\s*=\s*['"][^'"]+['"]/i,
  /token\s*=\s*['"][^'"]+['"]/i,
];

srcDirs.forEach(dirName => {
  const dir = path.join(__dirname, `../${dirName}`);
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { recursive: true });
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for dangerous patterns (but allow process.env access)
      dangerousPatterns.forEach(pattern => {
        if (pattern.test(content) && !content.includes('process.env')) {
          console.log(`   ⚠️  WARNING: Potential hardcoded credential in ${dirName}/${file}`);
          foundCredentials = true;
          hasWarnings = true;
        }
      });
    }
  });
});

if (!foundCredentials) {
  console.log('   ✅ No hardcoded credentials found');
}

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('📋 Security Verification Summary');
console.log('='.repeat(50));

if (hasErrors) {
  console.log('\n❌ FAILED: Critical security issues found!');
  console.log('Please fix the errors above before deploying.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  PASSED WITH WARNINGS');
  console.log('Review the warnings above to ensure proper security.\n');
  process.exit(0);
} else {
  console.log('\n✅ ALL CHECKS PASSED!');
  console.log('Security configuration looks good.\n');
  process.exit(0);
}

