
const client = require('../db-client');


client.query(`
  CREATE TABLE IF NOT EXISTS article_category_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    short_name VARCHAR(256) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS article (
    id SERIAL PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    author VARCHAR(256) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES article_category_table(id),
    is_clickbait BOOLEAN NOT NULL,
    views INTEGER
    );

`)
  
  .then(
    () => console.log('create tables complete'),
    // err => console.log(err)
  )
  .then(() => {
    client.end();
  });