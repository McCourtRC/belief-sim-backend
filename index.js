const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { JSDOM } = require('jsdom');

const app = express();
const port = 2000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
};
app.use(allowCrossDomain);

const dracula = require('./routes/data');
app.use('/data', dracula);

const nearest = require('./routes/nearest');
app.use('/nearest', nearest);

app.get('/', async (req, res) => {
  res.send('HEllo world');
});

app.get('/closest/word/:word', (req, res) => {
  const { word } = req.params;
  console.log('CLOSEST WORD');

  res.send(`Closest word to ${word} is `);
});

app.post('/webpage/parse', (req, res) => {
  const {
    body: { url },
  } = req;

  console.log('URL', url);

  JSDOM.fromURL(url)
    .then((dom) => {
      const {
        window: { document },
      } = dom;

      const pElements = Array.from(document.querySelectorAll('p'));
      const paragraphs = pElements
        .map((el) => el.textContent)
        .filter((val) => !!val);

      const sentences = paragraphs.reduce((acc, par) => {
        // Regex for splitting text into sentences
        // https://stackoverflow.com/questions/25735644/python-regex-for-splitting-text-into-sentences-sentence-tokenizing
        // NOTE: negative lookbehind may not be supported in all browsers
        const split = par.split(
          /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s/g
        );
        const trimmed = split.map((val) => val.trim());
        const filtered = trimmed.filter((val) => !!val);

        return acc.concat(filtered);
      }, []);

      res.json({
        paragraphs,
        sentences,
      });
    })
    .catch((err) => console.log('ERR', err));
});

app.listen(port, () => {
  console.log('LISTENING');
});
