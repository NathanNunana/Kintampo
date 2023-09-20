const { Pool } = require("pg");

// Create a PostgreSQL database connection pool
const pool = new Pool({
  connectionString:
    "postgresql://postgres:Bg9WWNm4UG6kWgqV2zKo@containers-us-west-138.railway.app:5777/railway",
});

pool.connect((err, client, done) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
  } else {
    console.log("Connected to PostgreSQL");
    done();
  }
});

module.exports = pool;
