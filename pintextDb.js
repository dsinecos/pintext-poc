
var pg = require('pg');

var connectionString = process.env.DATABASE_URL || "pg://postgres:postgres@localhost:5432/pintext";

var client = new pg.Client(connectionString);
client.connect();

client.query("DROP TABLE IF EXISTS pintext CASCADE");

client.query("CREATE TABLE IF NOT EXISTS pintext(user_id SERIAL PRIMARY KEY, title varchar(256), source varchar(512), textsnippet varchar, hash varchar(1024))");