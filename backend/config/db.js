// backend/config/db.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mariadb from 'mariadb';

// ES module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/* Connection pooling is a technique that helps improve the performance of Node.js applications which make frequent database requests.
 * Instead of opening a new connection for every request,
 * connection pooling allows the application to reuse existing connections from a pool,
 * which reduces the overhead of establishing new connections.
 */

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'habichew',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'habichew_db',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
  bigIntAsNumber: true,
});

// Export as ES module default
export default pool;

// Also export as named export for compatibility
export { pool };
