const { extname } = require('path');
const plantuml = require('node-plantuml');
const pEachSeries = require('p-each-series');
const pMap = require('p-map');
const getStream = require('get-stream');

const isMarkdown = (file) => /\.md$|\.markdown$/.test(extname(file));

const findPlantUMLs = (text) => text.match(/```plantuml(.*?)```/gms);
const nameOf = Object.keys;

const replace = (c, { svg, code }) => c.replace(
  code,
  `![plantuml](data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')})`,
);
const convertPlantUMLtoSVG = async (contents) => {
  const codes = findPlantUMLs(contents) || [];
  const found = await pMap(
    codes,
    (code) => {
      const uml = code.replace('```plantuml', '').replace('```', '');
      const gen = plantuml.generate(uml, { format: 'svg' });

      return getStream(gen.out)
        .then((svg) => svg.replace(/<\?xml.*?>/g, ''))
        .then((svg) => ({ code, svg }));
    },
  );
  return found.reduce(replace, contents);
};

const convert = async (files) => pEachSeries(
  nameOf(files)
    .filter(isMarkdown)
    .map((name) => files[name]),

  async (file) => {
    // eslint-disable-next-line no-param-reassign
    file.contents = Buffer
      .from(await convertPlantUMLtoSVG(file.contents.toString()));
  },
);

const plugin = (options = {}) => (files, metalsmith, done) => {
  const {
    codeBlocks,
  } = {
    codeBlocks: true,
    ...options,
  };

  if (!codeBlocks) {
    done();
  } else {
    convert(files).then(() => done(), done);
  }
};

module.exports = plugin;
