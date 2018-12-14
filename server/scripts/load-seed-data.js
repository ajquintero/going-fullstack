
const client = require ('../db-client');
const articles = require('./articles.json');
const categories = require('./categories');

Promise.all(
  categories.map(category => {
    return client.query(`
      INSERT INTO article_category_table (name, short_name)
      VALUES ($1, $2);
    `,
    [category.name, category.shortName]);
  })
)
  .then(() => {
    return Promise.all(
      articles.map(article => {
        return client.query(`
          INSERT INTO article (title, category_id, author, views, is_clickbait)
          SELECT
            $1 as title,
            id as category_id,
            $2 as author,
            $3 as views,
            $4 as is_clickbait
          FROM article_category_table
          WHERE short_name = $5;
        `,
        [article.title, article.author, article.views, article.isClickbait, article.category_id]);
      })
    );
  })
  .then(
    () => console.log('seed data load complete'),
    err => console.log(err)
  )
  .then(() => {
    client.end();
  });