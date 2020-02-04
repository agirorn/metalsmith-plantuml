const plantuml = require('node-plantuml');
const getStream = require('get-stream');

const {
  basename,
  dirname,
  extname,
  join,
} = require('path');

const isMarkdown = (file) => /\.md$|\.markdown$/.test(extname(file));
const isPlantumFile = (file) => /\.plantum/.test(extname(file));

const findPlantUMLs = (text) => text.match(/```plantuml(.*?)```/gms);
const findComments = (text) => text.match(/<!--(.*?)-->/gms);

const removeCommentFrom = (svg = '') => (findComments(svg) || [])
  .reduce((file, comment) => file.replace(comment, ''), svg);

const nameOf = Object.keys;

const replace = (c, { svg, code }) => c.replace(
  code,
  `![plantuml](data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')})`,
);
const convertPlantUMLtoSVG = async (contents) => {
  const codes = findPlantUMLs(contents) || [];

  const found = await Promise.all(
    codes.map((code) => {
      const uml = code.replace('```plantuml', '').replace('```', '');
      const gen = plantuml.generate(uml.trim(), { format: 'svg' });

      return getStream(gen.out)
        .then((svg) => svg.replace(/<\?xml.*?>/g, ''))
        .then((svg) => removeCommentFrom(svg))
        .then((svg) => ({ code, svg }));
    }),
  );
  return found.reduce(replace, contents);
};

const convertMarkdown = async (files) => Promise.all(
  nameOf(files)
    .filter(isMarkdown)
    .map((name) => files[name])
    .map(async (file) => {
      // eslint-disable-next-line no-param-reassign
      file.contents = Buffer
        .from(await convertPlantUMLtoSVG(file.contents.toString()));
    }),
);

const convertPlantUmlFileToSvg = async (files, name) => {
  const file = files[name];
  const dir = dirname(name);
  let svg = `${basename(name, extname(name))}.svg`;
  if (dir !== '.') {
    svg = join(dir, svg);
  }

  const gen = plantuml.generate(file.contents.toString().trim(), { format: 'svg' });
  file.contents = Buffer.from(removeCommentFrom(await getStream(gen.out)));

  delete files[name]; // eslint-disable-line no-param-reassign
  files[svg] = file; // eslint-disable-line no-param-reassign
};

const convertPlantUMl = async (files) => Promise.all(nameOf(files)
  .filter(isPlantumFile)
  .map((name) => convertPlantUmlFileToSvg(files, name)));

const plugin = (options = {}) => (files, metalsmith, done) => {
  const {
    codeBlocks,
  } = {
    codeBlocks: true,
    ...options,
  };

  Promise.all([
    codeBlocks
      ? convertMarkdown(files)
      : Promise.resolve(),
    convertPlantUMl(files),
  ]).then(() => done(), done);
};

module.exports = plugin;
