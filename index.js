const path = require('path');
const express = require('express');
const morgan = require('morgan');
const yup = require('yup');
const monk = require('monk');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { nanoid } = require('nanoid');
const cors = require('cors')
const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = monk(process.env.MONGODB_URI);
const urls = db.get('urls');

urls.createIndex({ slug: 1 }, { unique: true });


app.use(cors())
app.enable('trust proxy');
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('./src'));


const notFoundPath = path.join(__dirname, 'src/404.html');

app.get('/:id', async (req, res, next) => {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      return res.redirect(url.url);
    }
    return res.status(404).sendFile(notFoundPath);
  } catch (error) {
    return res.status(404).sendFile(notFoundPath);
  }
});

const schema = yup.object().shape({
  slug: yup.string().trim().matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
});

app.post('/url', 
// slowDown({
//   windowMs: 30 * 1000,
//   delayAfter: 1,
//   delayMs: 500,
// }), rateLimit({
//   windowMs: 30 * 1000,
//   max: 1,
// }), 
async (req, res, next) => {
  let { slug, url } = req.body;
  if (!slug) {
    slug = nanoid(5);
  } else {
    const existing = await urls.findOne({ slug });
    if (existing) {
      throw new Error('Slug already used, please try again');
    }
  }
  try {
    await schema.validate({
      slug,
      url,
    });
    slug = slug.toLowerCase();
    const newUrl = {
      url,
      slug,
    };
    const created = await urls.insert(newUrl);
    console.log(created);
    res.json(created);
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  res.status(404).sendFile(notFoundPath);
});


app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  });
});

var server = app.listen(process.env.PORT || 5000, function () {
  var port = server.address().port;
  console.log("Express is working on port " + port);
});