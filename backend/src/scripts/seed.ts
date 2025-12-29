#!/usr/bin/env node
import { seedDay1Data } from '../db/seed.js';

console.log('🌱 Seeding Day-1 data...');
seedDay1Data();
console.log('✅ Seeding complete!');
