const https = require('https');

const API_BASE = 'https://task-management-backend-8bvu.onrender.com';
let accessToken = '';
let refreshToken = '';
let taskId = '';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Test functions
async function test1_HealthCheck() {
  console.log('\n1️⃣  Testing Health Check...');
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASS: Health check successful');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log('❌ FAIL: Health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test2_Register() {
  console.log('\n2️⃣  Testing User Registration...');
  try {
    const response = await makeRequest(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: `testuser${Date.now()}@example.com`,
        password: 'Test123456'
      }
    });
    
    if (response.status === 201 && response.data.success) {
      accessToken = response.data.data.tokens.accessToken;
      refreshToken = response.data.data.tokens.refreshToken;
      console.log('✅ PASS: Registration successful');
      console.log('   User:', response.data.data.user.email);
      console.log('   Token Length:', accessToken.length);
      return true;
    } else {
      console.log('❌ FAIL: Registration failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test3_Login() {
  console.log('\n3️⃣  Testing User Login...');
  try {
    // Register a known user first
    const email = 'logintest@example.com';
    const password = 'Test123456';
    
    await makeRequest(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email, password }
    });

    // Now login
    const response = await makeRequest(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email, password }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASS: Login successful');
      console.log('   User:', response.data.data.user.email);
      return true;
    } else {
      console.log('❌ FAIL: Login failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test4_CreateTask() {
  console.log('\n4️⃣  Testing Create Task...');
  try {
    const response = await makeRequest(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: {
        title: 'Test Task from Automated Test',
        description: 'This is a test task',
        status: 'TODO'
      }
    });
    
    if (response.status === 201 && response.data.success) {
      taskId = response.data.data.id;
      console.log('✅ PASS: Task created');
      console.log('   Task ID:', taskId);
      console.log('   Title:', response.data.data.title);
      console.log('   Status:', response.data.data.status);
      return true;
    } else {
      console.log('❌ FAIL: Task creation failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test5_GetTasks() {
  console.log('\n5️⃣  Testing Get All Tasks...');
  try {
    const response = await makeRequest(`${API_BASE}/api/tasks?limit=10`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASS: Tasks retrieved');
      console.log('   Total:', response.data.data.tasks.length);
      console.log('   Has More:', response.data.data.hasMore);
      return true;
    } else {
      console.log('❌ FAIL: Get tasks failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test6_GetSingleTask() {
  console.log('\n6️⃣  Testing Get Single Task...');
  try {
    const response = await makeRequest(`${API_BASE}/api/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASS: Task details retrieved');
      console.log('   Title:', response.data.data.title);
      console.log('   Status:', response.data.data.status);
      return true;
    } else {
      console.log('❌ FAIL: Get task failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test7_UpdateTask() {
  console.log('\n7️⃣  Testing Update Task...');
  try {
    const response = await makeRequest(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: {
        title: 'Updated Test Task',
        status: 'IN_PROGRESS'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASS: Task updated');
      console.log('   New Title:', response.data.data.title);
      console.log('   New Status:', response.data.data.status);
      return true;
    } else {
      console.log('❌ FAIL: Update task failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test8_ToggleTask() {
  console.log('\n8️⃣  Testing Toggle Task Status...');
  try {
    const response = await makeRequest(`${API_BASE}/api/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASS: Task toggled');
      console.log('   Status:', response.data.data.status);
      return true;
    } else {
      console.log('❌ FAIL: Toggle task failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test9_FilterTasks() {
  console.log('\n9️⃣  Testing Task Filter and Search...');
  try {
    const response = await makeRequest(`${API_BASE}/api/tasks?status=TODO&search=Test&limit=5`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASS: Tasks filtered');
      console.log('   Results:', response.data.data.tasks.length);
      return true;
    } else {
      console.log('❌ FAIL: Filter tasks failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test10_RefreshToken() {
  console.log('\n🔟 Testing Token Refresh...');
  try {
    const response = await makeRequest(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { refreshToken }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ PASS: Token refreshed');
      console.log('   New Token Length:', response.data.data.accessToken.length);
      return true;
    } else {
      console.log('❌ FAIL: Token refresh failed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test11_DeleteTask() {
  console.log('\n1️⃣1️⃣  Testing Delete Task...');
  try {
    const response = await makeRequest(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (response.status === 204) {
      console.log('✅ PASS: Task deleted');
      return true;
    } else {
      console.log('❌ FAIL: Delete task failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function test12_Logout() {
  console.log('\n1️⃣2️⃣  Testing Logout...');
  try {
    const response = await makeRequest(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: { refreshToken }
    });
    
    if (response.status === 204) {
      console.log('✅ PASS: Logout successful');
      return true;
    } else {
      console.log('❌ FAIL: Logout failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Task Management API - Comprehensive Test Suite');
  console.log('='.repeat(60));
  console.log('API URL:', API_BASE);
  console.log('='.repeat(60));

  const results = [];
  
  results.push(await test1_HealthCheck());
  results.push(await test2_Register());
  results.push(await test3_Login());
  results.push(await test4_CreateTask());
  results.push(await test5_GetTasks());
  results.push(await test6_GetSingleTask());
  results.push(await test7_UpdateTask());
  results.push(await test8_ToggleTask());
  results.push(await test9_FilterTasks());
  results.push(await test10_RefreshToken());
  results.push(await test11_DeleteTask());
  results.push(await test12_Logout());

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  
  console.log(`✅ Passed: ${passed}/12`);
  console.log(`❌ Failed: ${failed}/12`);
  console.log(`📈 Success Rate: ${Math.round((passed/12)*100)}%`);
  console.log('='.repeat(60));

  if (passed === 12) {
    console.log('\n🎉 ALL TESTS PASSED! API is fully functional.');
    console.log('✅ Ready to integrate into Flutter app!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

runAllTests();
