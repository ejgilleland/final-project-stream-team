require('dotenv/config');
const express = require('express');
const errorMiddleware = require('./error-middleware');
const staticMiddleware = require('./static-middleware');
const pg = require('pg');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();

const jsonMiddleware = express.json();

app.use(jsonMiddleware);

app.use(staticMiddleware);

app.get('/api/likes', (req, res, next) => {
  const sql = `
    select *
    from "likes"
    join "streamers" using ("streamerId")
    where "userId" = $1
    order by "displayName";
  `;
  const params = [1];
  // will remove the hard coding when authorized user functionality is implemented - selecting userId of 1 for now
  db
    .query(sql, params)
    .then(data => {
      const likes = data.rows;
      res.status(200).json(likes);
    })
    .catch(err => next(err));
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`express server listening on port ${process.env.PORT}`);
});
