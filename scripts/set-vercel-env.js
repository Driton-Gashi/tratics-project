#!/usr/bin/env node

/**
 * Script to set environment variables in Vercel
 * Usage: node scripts/set-vercel-env.js
 */

const { execSync } = require('child_process');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function execCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up Vercel environment variables...\n');

  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('❌ Vercel CLI is not installed.');
    console.log('Install it with: npm i -g vercel\n');
    process.exit(1);
  }

  // Check if user is logged in
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
  } catch (error) {
    console.log('❌ Not logged in to Vercel.');
    console.log('Login with: vercel login\n');
    process.exit(1);
  }

  console.log('📝 Please provide the following information:\n');

  // Database configuration
  const dbHost = await question('DB_HOST (e.g., mysql.hostinger.com): ');
  const dbPort = (await question('DB_PORT [3306]: ')) || '3306';
  const dbUser = await question('DB_USER: ');
  const dbPassword = await question('DB_PASSWORD: ');
  const dbName = await question('DB_NAME: ');

  // Generate JWT_SECRET if not provided
  console.log('');
  let jwtSecret = await question('JWT_SECRET (press Enter to generate a secure one): ');
  if (!jwtSecret) {
    jwtSecret = crypto.randomBytes(32).toString('hex');
    console.log(`✅ Generated JWT_SECRET: ${jwtSecret}`);
    console.log('⚠️  IMPORTANT: Save this JWT_SECRET securely!\n');
  }

  // Get Vercel domain
  const vercelDomain = await question('Vercel domain (e.g., your-app.vercel.app): ');
  if (!vercelDomain) {
    console.log('⚠️  You can set this later. Using placeholder for now.\n');
  }

  const clientUrl = vercelDomain ? `https://${vercelDomain}` : 'https://your-app.vercel.app';
  const nextPublicApiUrl = vercelDomain
    ? `https://${vercelDomain}/api`
    : 'https://your-app.vercel.app/api';

  console.log('\n📋 Summary:');
  console.log(`  DB_HOST: ${dbHost}`);
  console.log(`  DB_PORT: ${dbPort}`);
  console.log(`  DB_USER: ${dbUser}`);
  console.log(`  DB_NAME: ${dbName}`);
  console.log(`  JWT_SECRET: ${jwtSecret.substring(0, 20)}... (hidden)`);
  console.log(`  CLIENT_URL: ${clientUrl}`);
  console.log(`  NEXT_PUBLIC_API_URL: ${nextPublicApiUrl}\n`);

  const confirm = await question('Continue with setting these variables? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled.\n');
    rl.close();
    process.exit(1);
  }

  console.log('\n🔧 Setting environment variables...\n');

  // Set production environment variables
  const envVars = [
    { name: 'DB_HOST', value: dbHost },
    { name: 'DB_PORT', value: dbPort },
    { name: 'DB_USER', value: dbUser },
    { name: 'DB_PASSWORD', value: dbPassword },
    { name: 'DB_NAME', value: dbName },
    { name: 'JWT_SECRET', value: jwtSecret },
    { name: 'COOKIE_SECURE', value: 'true' },
    { name: 'CLIENT_URL', value: clientUrl },
    { name: 'NODE_ENV', value: 'production' },
    { name: 'PORT', value: '4000' },
    { name: 'NEXT_PUBLIC_API_URL', value: nextPublicApiUrl },
  ];

  for (const envVar of envVars) {
    try {
      execSync(`echo "${envVar.value}" | vercel env add ${envVar.name} production`, {
        stdio: 'inherit',
      });
      console.log(`✅ Set ${envVar.name}`);
    } catch (error) {
      console.log(`❌ Failed to set ${envVar.name}`);
    }
  }

  console.log('\n✅ Environment variables set for production!');
  console.log('\n💡 Tip: You can also set these for preview and development environments:');
  console.log('   vercel env add <VAR_NAME> preview');
  console.log('   vercel env add <VAR_NAME> development');
  console.log('\n🔐 Your JWT_SECRET (save this securely!):');
  console.log(jwtSecret);
  console.log('');

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
