/**
 * Fix script: creates faculty profile rows for any faculty user
 * that is missing one. Run once: node scripts/fix_faculty_profiles.js
 */

import { pool, query } from '../config/db.js';
import { logger } from '../utils/logger.js';

async function fixFacultyProfiles() {
  /* Find all faculty users who have no row in the faculty table */
  const { rows: missing } = await query(`
    SELECT u.id, u.name, u.email
    FROM users u
    LEFT JOIN faculty f ON f.user_id = u.id
    WHERE u.role = 'faculty' AND f.id IS NULL
    ORDER BY u.id
  `);

  if (missing.length === 0) {
    logger.info('All faculty users already have profiles. Nothing to do.');
    await pool.end();
    return;
  }

  logger.info(`Found ${missing.length} faculty user(s) without a profile:`);
  missing.forEach(u => logger.info(`  - ${u.name} (${u.email})`));

  for (const user of missing) {
    /* Generate a unique employee ID from the user ID */
    const employeeId = `CU-F-AUTO-${user.id}`;
    await query(
      `INSERT INTO faculty (user_id, employee_id, designation)
       VALUES ($1, $2, 'Faculty')
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id, employeeId]
    );
    logger.info(`  ✓ Created profile for ${user.name} — employee_id: ${employeeId}`);
  }

  logger.info('Done. All faculty users now have profiles.');
  await pool.end();
}

fixFacultyProfiles().catch(err => {
  logger.error({ err }, 'Fix script failed');
  process.exit(1);
});
