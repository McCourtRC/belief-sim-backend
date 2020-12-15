const router = require('express').Router();
const {
  getSentVec,
  euclideanDist,
  vecTxt2json,
  beliefTxt2json,
} = require('../utils');

router.post('/sentence', (req, res) => {
  const {
    body: { sent, wordVecFilename = 'wordvecs70000.json' },
  } = req;

  if (!sent)
    return res.json({
      error: `ERROR: missing params sent(${sent}) `,
    });

  const { vectors: wordVecs } = require(`../data/${wordVecFilename}`);
  // const { vectors: sentVecs } = require(`../data/dracula-vecs-x50.json`);
  // const sentBeliefs = require(`../data/dracula-belief-vals.json`);

  const sentVecs = vecTxt2json('data/mega-belief-vecs.txt');
  const sentBeliefs = beliefTxt2json('data/mega-belief-vals.txt');

  // console.log(sentVecs);
  // console.log(sentBeliefs);

  const testVec = getSentVec(sent, wordVecs);
  testVec.print();

  const keys = Object.keys(sentVecs);

  // get distances of textVec from all other sentences
  // [dist, val];
  const distances = [];
  keys.forEach((key) => {
    const sentVec = sentVecs[key];
    const dist = euclideanDist(testVec, sentVec);
    distances.push([dist, key]);
  });

  // loop through and sort sentvecs by dist
  const sorted = distances.sort(([distA], [distB]) => {
    return distA - distB;
  });

  // get average belief value from (n) closest sentences
  const nResults = 10;
  const topResults = sorted.slice(0, nResults);
  const topSents = topResults.map((res) => res[1]);

  const beliefTotal = topSents.reduce((acc, top) => {
    return acc + sentBeliefs[top];
  }, 0);

  const beliefAvg = beliefTotal / nResults;
  console.log('BELIEF AVG', beliefAvg);

  // get first element from sorted, and get text
  const simDist = sorted[0][0];
  const simSent = sorted[0][1];

  console.log();
  console.log('CLOSEST SENT ');
  console.log('TO:', sent);
  console.log();
  console.log('IS:', simSent);
  console.log();
  console.log('DIST:', simDist);
  res.json({ simSent, simDist, topSents, beliefAvg });
});

module.exports = router;
