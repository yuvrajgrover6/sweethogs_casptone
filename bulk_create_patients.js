#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const BATCH_SIZE = 10; // Number of patients to create at once
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

// Read sample data
const sampleDataPath = path.join(__dirname, 'sample_data.json');
let patients;

try {
  const rawData = fs.readFileSync(sampleDataPath, 'utf8');
  patients = JSON.parse(rawData);
  console.log(`📊 Loaded ${patients.length} patients from sample_data.json`);
} catch (error) {
  console.error('❌ Error reading sample_data.json:', error.message);
  process.exit(1);
}

// Get JWT token
async function getAuthToken() {
  try {
    console.log('🔐 Getting authentication token...');
    
    // First, try to login with existing user
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Logged in successfully');
      return loginData.body.accessToken;
    }

    // If login fails, register a new user
    console.log('📝 User not found, registering new user...');
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
      throw new Error(`Registration failed: ${errorData.message}`);
    }

    const registerData = await registerResponse.json();
    console.log('✅ User registered successfully');
    return registerData.body.accessToken;

  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }
}

// Create a single patient
async function createPatient(patientData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(patientData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || `HTTP ${response.status}`,
        patient: patientData
      };
    }

    return {
      success: true,
      patient: responseData.body.patient
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      patient: patientData
    };
  }
}

// Process patients in batches
async function createPatientsInBatches(patients, token) {
  const results = {
    total: patients.length,
    created: 0,
    errors: []
  };

  console.log(`🚀 Starting to create ${patients.length} patients in batches of ${BATCH_SIZE}...`);
  console.log('📊 Progress: [████████████████████████████████████████] 0%');

  for (let i = 0; i < patients.length; i += BATCH_SIZE) {
    const batch = patients.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(patient => createPatient(patient, token));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      
      // Process batch results
      for (const result of batchResults) {
        if (result.success) {
          results.created++;
        } else {
          results.errors.push({
            encounter_id: result.patient.encounter_id,
            patient_nbr: result.patient.patient_nbr,
            error: result.error
          });
        }
      }

      // Update progress
      const progress = Math.round((i + batch.length) / patients.length * 100);
      const progressBar = '█'.repeat(Math.floor(progress / 2.5)) + '░'.repeat(40 - Math.floor(progress / 2.5));
      process.stdout.write(`\r📊 Progress: [${progressBar}] ${progress}% (${results.created}/${patients.length} created)`);

      // Delay between batches to avoid overwhelming the server
      if (i + BATCH_SIZE < patients.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }

    } catch (error) {
      console.error(`\n❌ Batch error at index ${i}:`, error.message);
    }
  }

  console.log('\n'); // New line after progress bar
  return results;
}

// Main function
async function main() {
  console.log('🏥 Patient Bulk Creation Script');
  console.log('===============================\n');

  // Get authentication token
  const token = await getAuthToken();

  // Create all patients
  const results = await createPatientsInBatches(patients, token);

  // Display results
  console.log('\n📈 Creation Results:');
  console.log('==================');
  console.log(`✅ Successfully created: ${results.created} patients`);
  console.log(`❌ Failed to create: ${results.errors.length} patients`);
  console.log(`📊 Success rate: ${Math.round((results.created / results.total) * 100)}%`);

  // Display errors if any
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    console.log('=========');
    results.errors.slice(0, 10).forEach((error, index) => {
      console.log(`${index + 1}. Encounter ${error.encounter_id} (Patient ${error.patient_nbr}): ${error.error}`);
    });
    
    if (results.errors.length > 10) {
      console.log(`... and ${results.errors.length - 10} more errors`);
    }

    // Save detailed error log
    const errorLogPath = path.join(__dirname, 'patient_creation_errors.json');
    fs.writeFileSync(errorLogPath, JSON.stringify(results.errors, null, 2));
    console.log(`📄 Detailed error log saved to: ${errorLogPath}`);
  }

  console.log('\n🎉 Bulk patient creation completed!');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  Process interrupted by user');
  process.exit(0);
});

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Start the process
checkServerHealth().then(isServerRunning => {
  if (!isServerRunning) {
    console.error('❌ Server is not running. Please start the server with "bun run dev" first.');
    process.exit(1);
  }
  main();
});
