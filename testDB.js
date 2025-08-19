import db from './db.js';

async function testConnection() {
    try {
        const result = await db.query('SELECT * FROM books;');
        // console.log("da connected. data result: " + JSON.stringify(result.rows, null, 2));
        console.table(result.rows);
    } catch (error) {
        console.log("db connection failed: " + error);
    } finally {
        await db.end();
    }
}

testConnection();