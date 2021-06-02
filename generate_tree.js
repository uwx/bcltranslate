/* eslint-disable unicorn/prefer-spread */
/* eslint-disable unicorn/prefer-query-selector */

const { DOMParser } = require('xmldom');
const klaw = require('klaw');
const fs = require('fs');
const path = require('path');

const domParser = new DOMParser();

const tree = {};

function put(project, lang, entryName, entrySpaceFlag, entryValue) {
  tree[project] = tree[project] || {};
  tree[project][entryName] = tree[project][entryName] || {};

  if (lang === null) {
    lang = 'default';
  }

  tree[project][entryName][lang] = {
    xmlSpace: entrySpaceFlag,
    value: entryValue
  };
}

klaw('.')
  .on('data', item => {
    const basename = path.basename(item.path);
    if (basename.startsWith('Strings.') && basename.endsWith('.resx')) {
      let lang = basename.match(/Strings\.(.*?)\.resx/);
      if (lang !== null) {
        lang = lang[1]; // capturing group 1
      }

      console.log(item.path);

      const sourceProject = path.basename(path.dirname(path.dirname(path.dirname(item.path))));
      //console.log(sourceProject);

      const xml = fs.readFileSync(item.path, 'utf8');
      const document = domParser.parseFromString(xml, 'text/xml');

      const elements = document.getElementsByTagName('data');

      for (const element of Array.from(elements)) {
        const entryName = element.getAttribute('name');
        const entrySpaceFlag = element.getAttribute('xml:space');
        const entryValue = element.textContent.trim();

        put(sourceProject, lang, entryName, entrySpaceFlag, entryValue);
      }
    }
    //if (path.startsWith(''))
    //
  })
  .on('end', () => {
    for (const [projectName, project] of Object.entries(tree)) {
      for (const [entryName, entry] of Object.entries(project)) {
        if (Object.keys(entry).length === 1) {
          delete project[entryName];
        }
      }
      if (Object.keys(project).length === 0) {
        delete tree[projectName];
      }
    }

    console.log(tree);

    fs.writeFileSync('treegen.json', JSON.stringify(tree, null, 2));
  });
