import { getDatabase } from '../db/index.js';
import { AuthService } from '../services/auth.js';

const db = getDatabase();
const authService = new AuthService(db);

const admin = db.prepare('SELECT id, organization_id FROM users WHERE email = ?').get('admin@acme.com') as any;
if (admin) {
  authService.assignRole(admin.id, 'admin', admin.organization_id);
  console.log('✅ Admin role assigned to admin@acme.com');
  
  // Verify
  const roles = db.prepare('SELECT r.name FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?').all(admin.id) as any[];
  console.log('   Assigned roles:', roles.map(r => r.name));
} else {
  console.log('❌ Admin user not found');
}

