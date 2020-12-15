module.exports = function (paragraphs) {
  const sentences = paragraphs.reduce((acc, par) => {
    // Regex for splitting text into sentences
    // https://stackoverflow.com/questions/25735644/python-regex-for-splitting-text-into-sentences-sentence-tokenizing
    // NOTE: negative lookbehind may not be supported in all browsers
    const split = par.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s/g);
    const trimmed = split.map((val) => val.trim());
    const filtered = trimmed.filter((val) => !!val);

    return acc.concat(filtered);
  }, []);

  return sentences;
};
