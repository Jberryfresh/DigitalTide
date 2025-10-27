/**
 * Test CSP Integration
 * Tests the security middleware implementation
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

console.log('Testing CSP Integration...\n');

async function testCsrfToken() {
  console.log('1. Testing CSRF Token Generation...');
  try {
    const response = await fetch(`${BASE_URL}/api/v1/security/csrf-token`);
    const data = await response.json();
    
    if (data.success && data.data.csrfToken) {
      console.log('   ✅ CSRF token generated successfully');
      console.log(`   Token: ${data.data.csrfToken.substring(0, 20)}...`);
      return data.data.csrfToken;
    } else {
      console.log('   ❌ Failed to generate CSRF token');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  return null;
}

async function testSecurityHeaders() {
  console.log('\n2. Testing Security Headers...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const headers = response.headers;
    
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
      'permissions-policy',
      'content-security-policy'
    ];
    
    console.log('\n   Security Headers Present:');
    for (const header of requiredHeaders) {
      const value = headers.get(header);
      if (value) {
        console.log(`   ✅ ${header}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
      } else {
        console.log(`   ❌ ${header}: NOT PRESENT`);
      }
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}

async function testCspNonce() {
  console.log('\n3. Testing CSP Nonce Generation...');
  try {
    const response1 = await fetch(`${BASE_URL}/health`);
    const csp1 = response1.headers.get('content-security-policy');
    
    const response2 = await fetch(`${BASE_URL}/health`);
    const csp2 = response2.headers.get('content-security-policy');
    
    // Extract nonce values
    const nonceRegex = /'nonce-([^']+)'/g;
    const nonces1 = [...csp1.matchAll(nonceRegex)].map(m => m[1]);
    const nonces2 = [...csp2.matchAll(nonceRegex)].map(m => m[1]);
    
    if (nonces1.length > 0 && nonces2.length > 0) {
      console.log(`   ✅ CSP nonces generated (${nonces1.length} per request)`);
      console.log(`   Nonce 1: ${nonces1[0]}`);
      console.log(`   Nonce 2: ${nonces2[0]}`);
      
      if (nonces1[0] !== nonces2[0]) {
        console.log('   ✅ Nonces are unique per request');
      } else {
        console.log('   ⚠️  Nonces are the same (should be unique)');
      }
    } else {
      console.log('   ❌ No CSP nonces found in headers');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  await testCsrfToken();
  await testSecurityHeaders();
  await testCspNonce();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('CSP Integration Tests Complete!');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(console.error);
