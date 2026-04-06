// Create a persistent connection pool
import serverlessMysql from 'serverless-mysql';

const mysql = require('serverless-mysql');

// Create a persistent connection pool
/**
 * Represents an instance of a serverless MySQL connection pool.
 * Handles database connections configured with environment variables.
 * Configures host, database name, user, password, and connection options.
 * Supports persistent connections with customizable limits.
 */
const db: serverlessMysql.ServerlessMysql = mysql({
    config: {
        host: process.env.APP_HOST,
        database: process.env.APP_DATA_BASE,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        waitForConnections: true,
        multipleStatements: true,
        connectionLimit: 10,
        queueLimit: 0
    }
});

// Create an async function to run queries
export async function runQuery<T>(queryString: string, values: any[] = []): Promise<T> {
    try {
        return await db.query(queryString, values);
    } catch (error) {
        console.error(`Error running query: ${queryString}`);
        throw error;
    } finally {
        await db.end();
    }
}

// Export the function for use in other course_modules
module.exports = {
    db,
    runQuery
};
