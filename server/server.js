const express = require('express');
const app = express();
const morgan = require('morgan');
const client = require('./db-client');

/* setting up simple database */

app.use(morgan('dev'));

app.use(express.json());

/* connect to pg */

console.log('I am the server file');



app.get('/api/articles', (req, res) => {
  client.query(`
    SELECT id, title, views 
    FROM article
    ORDER BY title;
  `)
    .then(result => {
      res.json(result.rows);
    });
});


app.get('/api/categories', (req, res) => {
  client.query(`
    SELECT
      article.id,
      article.title as title,
      article.author as author,
      article.views as views,
      article.is_clickbait as "isClickbait",
      article.category as category
    FROM article
    JOIN article_category_table
    ON article.category = article_category_table.id
    ORDER BY views DESC, name ASC;
  `)
    .then(result => {
      res.json(result.rows);
    });
});

app.get('/api/articles/:id', (req, res) => {

  client.query(`
    SELECT * FROM article 
    WHERE id = $1
    JOIN article_category_table
    ON article.category = article_category_table.id
    WHERE article_category_table.id = $1;
  `,
  [req.params.id])
    .then(result => {
      res.json(result.rows[0]);
    });
});

app.post('/api/articles', (req, res)=> {
  const body = req.body;

  client.query(`
    INSERT INTO article (title, author, views, is_clickbait, category)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
  `,
  [body.title, body.author, body.views, body.category])
    .then(result => {
      const id = result.rows[0].id;

      return client.query(`
        SELECT
          article.id,
          article.title as title,
          article.author as author,
          article.views as views
        FROM article
        JOIN article_category_table
        ON article.track_id = track.id
        WHERE article.id = $1;
      `,
      [id]);
    })
    .then(result => {
      res.json(result.rows[0]);
    });
});

app.delete('/api/articles/:id', (req, res) => {
  client.query(`
    DELETE FROM article WHERE id = $1;
  `,
  [req.params.id])
    .then(result => {
      res.json({ removed:result.rowCount === 1 });
    });
});

app.put('/api/articles/:id', (req, res) => {
  const body = req.body;

  client.query(`
      UPDATE article
      SET
        title = $1,
        article_category_table.id = $2,
        author = $3,
        is_clickbait = $4,
        views = $5
      WHERE id = $6
      RETURNING
        id, 
        title,
        article_category_table.id as as "categoryId",
        author,
        is_clickbait as "isClickbait,
        views
    `,
  [body.title, body.categoryId, body.author, body.isClickbait, body.views, body.id])
    .then(result => {
      res.json(result.rows[0]);
    });
});
/* configure and start the server */
const PORT = 3000;

app.listen(PORT, () => {
  console.log('server app started on port', PORT);

  console.log('running on', PORT);
});