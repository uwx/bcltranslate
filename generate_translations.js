const tree = require('./treegen.json');

const findReplace = [];

function escapeRegExp(string) {
  return string.replace(/[$()*+.?[\\\]^|]/g, '\\$&'); // $& means the whole matched string
}

function makeRegex(string) {
  return escapeRegExp(string).replace(/{(\d+)}/g, '(.*?)');
}

function makeResult(string) {
  let i = 0;
  return string.replace(/{(\d+)}/g, (match, p1) => {
    return '$' + ++i;
  });
}

for (const [projectName, project] of Object.entries(tree)) {
  for (const [entryName, entry] of Object.entries(project)) {
    if (!entry.default) {
      console.warn('no entry default: ' + entryName);
      continue;
    }

    for (const [language, {xmlSpace, value}] of Object.entries(entry)) {
      if (language === 'default') {
        continue;
      }

      console.log(entryName);

      findReplace.push([makeRegex(value), makeResult((entry.default || entry.en).value)]);
    }
  }
}

findReplace.sort((a,b) => b[0].length - a[0].length);

require('fs').writeFileSync('translations.json', JSON.stringify(findReplace));
