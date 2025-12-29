import { getDatabase } from '../db/index.js';
import { AuthService } from '../services/auth.js';

async function createTestUsers() {
  const db = getDatabase();
  const authService = new AuthService(db);

  // Get the first organization
  const org = db.prepare('SELECT id FROM organizations LIMIT 1').get() as any;
  
  if (!org) {
    console.error('❌ No organization found. Please run seed script first.');
    return;
  }

  const orgId = org.id;

  console.log('🔐 Creating test users...');

  const users = [
    { email: 'admin@acme.com', password: 'admin123', name: 'Admin User', role: 'admin' },
    { email: 'riskmanager@acme.com', password: 'manager123', name: 'Risk Manager', role: 'risk_manager' },
    { email: 'executive@acme.com', password: 'exec123', name: 'Executive', role: 'executive' },
    { email: 'riskowner@acme.com', password: 'owner123', name: 'Risk Owner', role: 'risk_owner' },
  ];

  for (const userData of users) {
    try {
      // Check if user exists
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(userData.email);
      
      if (existing) {
        console.log(`ℹ️  User ${userData.email} already exists, skipping...`);
        // Update password if needed
        const passwordHash = await import('bcryptjs').then(m => m.default.hash(userData.password, 10));
        db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, userData.email);
        console.log(`   Updated password for ${userData.email}`);
      } else {
        const user = await authService.register(
          userData.email,
          userData.password,
          userData.name,
          orgId
        );
        
        // Assign role
        authService.assignRole(user.id, userData.role, orgId);
        console.log(`✅ Created ${userData.email} (${userData.role})`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to create ${userData.email}:`, error.message);
    }
  }

  console.log('\n📝 Test user credentials:');
  users.forEach(u => {
    console.log(`   ${u.email} / ${u.password} (${u.role})`);
  });
}

createTestUsers().catch(console.error);

