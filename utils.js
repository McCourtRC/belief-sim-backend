const fs = require('fs');
const tf = require('@tensorflow/tfjs');

// FORMAT:
// TXT 0 this is a sentence\n ...
// OUT {"this is a sentence": 0, ...}
const beliefTxt2json = (filename) => {
  const data = fs.readFileSync(filename).toString();

  // split lines into val and sentence
  const lines = data.split('\n');

  const json = {};
  lines.forEach((line) => {
    const [val, sent = ''] = line.split('***');
    const trim = sent.trim();

    if (trim) {
      json[trim] = parseInt(val);
    }
  });

  return json;
};

// FORMAT:
// TXT this is a sentence *** 123 4234 53453 422\n ...
// OUT {"this is a sentence": 0, ...}
const vecTxt2json = (filename) => {
  const data = fs.readFileSync(filename).toString();

  // split lines into sentence and nums
  const lines = data.split('\n');

  const json = {};
  lines.forEach((line) => {
    const [sent = '', nums] = line.split('***');
    const trim = sent.trim();

    if (trim) {
      json[trim] = nums.trim().split(' ').map(parseFloat);
    }
  });

  return json;
};

// FORMAT:
// STR 'this is a sentence'
// OBJ { word: vec, ... }
// OUT [1, 23, 43, 54, ...] (vector based)
const getSentVec = (sent, fromWordVecs, uniformVecs = false) => {
  const wordsPerSent = 155;
  const vecLen = Object.values(fromWordVecs)[0].length;

  // Split sentence into words
  const words = sent.toLowerCase().split(' ');

  // Get the word vectors
  const wordVecs = [];
  words.forEach((w) => {
    // extract words with regex
    const match = w.match(/\w+/g);
    const word = (match && match[0]) || '';

    // get word vector data
    let vec = fromWordVecs[word];

    // Word doesn't exists fill with empty array
    if (!word || !vec) vec = new Array(vecLen).fill(0);

    wordVecs.push(vec);
  });

  // Add empty word vecs to have uniform sentence length
  if (uniformVecs) {
    for (let i = wordVecs.length; i < wordsPerSent; i++) {
      wordVecs.push(new Array(vecLen).fill(0));
    }
  }

  // Convert to tensor to perform math
  const sentTens = tf.tensor(wordVecs);

  // Average the word component vectors
  const sentMean = tf.mean(sentTens, 0, false);

  // console.log('SENT VEC');
  // sentMean.print();

  return sentMean;
};

// FORMAT:
// TENS x, y
// OUT  dist
const euclideanDist = (x, y) => {
  const diffs = tf.sub(y, x);
  const squares = tf.square(diffs);
  const sum = tf.sum(squares);
  const dist = tf.sqrt(sum);
  return dist.arraySync();
};

module.exports = {
  beliefTxt2json,
  vecTxt2json,
  getSentVec,
  euclideanDist,
};
