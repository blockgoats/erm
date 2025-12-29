import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/types.js';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  organization_id?: string;
  roles: string[];
  permissions: string[];
}

export class AuthService {
  constructor(private db: Database.Database) {}

  /**
   * Register a new user
   */
  async register(email: string, password: string, fullName?: string, organizationId?: string): Promise<User> {
    const existing = this.db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, organization_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, email, passwordHash, fullName || null, organizationId || null, now, now);

    // Assign default role (risk_owner) if no org specified
    if (organizationId) {
      this.assignRole(id, 'risk_owner', organizationId);
    }

    return this.getUserById(id)!;
  }

  /**
   * Authenticate user and return JWT token
   */
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const authUser = await this.getAuthUser(user.id);
    const token = this.generateToken(authUser);

    return { token, user: authUser };
  }

  /**
   * Get authenticated user with roles and permissions
   */
  async getAuthUser(userId: string, organizationId?: string): Promise<AuthUser> {
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      throw new Error('User not found');
    }

    const orgId = organizationId || user.organization_id;
    if (!orgId) {
      throw new Error('User has no organization');
    }

    // Get user roles for this organization
    const roles = this.db.prepare(`
      SELECT r.id, r.name 
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ? AND (ur.organization_id = ? OR ur.organization_id IS NULL)
    `).all(userId, orgId) as Array<{ id: string; name: string }>;

    const roleIds = roles.map(r => r.id);

    // Get permissions for these roles
    const permissions = this.db.prepare(`
      SELECT DISTINCT p.id
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id IN (${roleIds.map(() => '?').join(',')})
    `).all(...roleIds) as Array<{ id: string }>;

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      organization_id: orgId,
      roles: roleIds,
      permissions: permissions.map(p => p.id),
    };
  }

  /**
   * Assign role to user
   */
  assignRole(userId: string, roleId: string, organizationId?: string): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO user_roles (user_id, role_id, organization_id)
      VALUES (?, ?, ?)
    `);
    stmt.run(userId, roleId, organizationId || null);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): AuthUser {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    try {
      const decoded = jwt.verify(token, secret) as any;
      return decoded.user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: AuthUser): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    // @ts-ignore - jwt.sign overload resolution issue with expiresIn
    return jwt.sign({ user }, secret, { expiresIn }) as string;
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | null {
    const stmt = this.db.prepare('SELECT id, email, full_name, organization_id, created_at, updated_at FROM users WHERE id = ?');
    const row = stmt.get(userId) as any;
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      password_hash: '', // Don't return password hash
      full_name: row.full_name,
      organization_id: row.organization_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: AuthUser, resource: string, action: string): boolean {
    const permissionId = `${resource}:${action}`;
    return user.permissions.includes(permissionId) || user.roles.includes('admin');
  }
}

