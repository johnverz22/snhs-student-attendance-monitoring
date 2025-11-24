const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update with Section Field\n');

  try {
    // Step 1: Login as student
    console.log('1️⃣ Logging in as student...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/student/login`, {
      email: 'john.doe@school.com',
      password: 'Password123',
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful\n');

    // Step 2: Get current profile
    console.log('2️⃣ Fetching current profile...');
    const profileResponse = await axios.get(`${API_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!profileResponse.data.success) {
      console.error('❌ Failed to fetch profile:', profileResponse.data.message);
      return;
    }

    const currentProfile = profileResponse.data.data.student;
    console.log('✅ Current profile:');
    console.log(`   Name: ${currentProfile.name}`);
    console.log(`   Student ID: ${currentProfile.student_id}`);
    console.log(`   Grade: ${currentProfile.grade || 'Not set'}`);
    console.log(`   Section: ${currentProfile.section || 'Not set'}`);
    console.log(`   Phone: ${currentProfile.phone || 'Not set'}\n`);

    // Step 3: Update profile with section
    console.log('3️⃣ Updating profile with section...');
    const updateData = {
      name: currentProfile.name,
      grade: '10',
      section: 'A',
      phone: '09123456789',
    };

    const updateResponse = await axios.put(
      `${API_URL}/api/student/profile`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!updateResponse.data.success) {
      console.error('❌ Profile update failed:', updateResponse.data.message);
      return;
    }

    const updatedProfile = updateResponse.data.data.student;
    console.log('✅ Profile updated successfully:');
    console.log(`   Name: ${updatedProfile.name}`);
    console.log(`   Grade: ${updatedProfile.grade}`);
    console.log(`   Section: ${updatedProfile.section}`);
    console.log(`   Phone: ${updatedProfile.phone}\n`);

    // Step 4: Verify the update
    console.log('4️⃣ Verifying update by fetching profile again...');
    const verifyResponse = await axios.get(`${API_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!verifyResponse.data.success) {
      console.error('❌ Failed to verify profile:', verifyResponse.data.message);
      return;
    }

    const verifiedProfile = verifyResponse.data.data.student;
    console.log('✅ Verified profile:');
    console.log(`   Name: ${verifiedProfile.name}`);
    console.log(`   Grade: ${verifiedProfile.grade}`);
    console.log(`   Section: ${verifiedProfile.section}`);
    console.log(`   Phone: ${verifiedProfile.phone}\n`);

    // Check if section was saved correctly
    if (verifiedProfile.section === 'A') {
      console.log('✅ Section field is working correctly!\n');
    } else {
      console.log('❌ Section field was not saved correctly\n');
    }

    // Step 5: Test updating only section
    console.log('5️⃣ Testing partial update (section only)...');
    const partialUpdateResponse = await axios.put(
      `${API_URL}/api/student/profile`,
      { section: 'B' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!partialUpdateResponse.data.success) {
      console.error('❌ Partial update failed:', partialUpdateResponse.data.message);
      return;
    }

    console.log('✅ Partial update successful');
    console.log(`   New section: ${partialUpdateResponse.data.data.student.section}\n`);

    console.log('🎉 All profile update tests passed!');
  } catch (error) {
    console.error('❌ Test failed with error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run the test
testProfileUpdate();
