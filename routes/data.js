const fs = require('fs');
const router = require('express').Router();
const dracula = require('../data/dracula.json');
const wordvecs70000 = require('../data/wordvecs70000.json');
const { getSentVec, beliefTxt2json, vecTxt2json } = require('../utils');

router.get('/dracula', (req, res) => {
  res.json(dracula);
});
router.get('/wordvecs70000', (req, res) => {
  console.log('WORDVECS');
  res.json(wordvecs70000);
});

router.post('/belief', (req, res) => {
  console.log('POSTING BELIEF');
  const {
    body: { sent, belief },
  } = req;

  // // SAVE DATA TO DATABASE (TXT FILES FOR NOW)
  const beliefLine = `${belief} *** ${sent}\n`;

  const sentVec = getSentVec(sent, wordvecs70000.vectors).arraySync();
  const vecLine = `${sent} *** ${sentVec.join(' ')}\n`;

  fs.appendFileSync('data/mega-belief-vals.txt', beliefLine);
  fs.appendFileSync('data/mega-belief-vecs.txt', vecLine);

  res.send('SUCCES');
});

module.exports = router;
