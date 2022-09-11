const { readFile } = require('fs').promises;
const { resolve } = require('path');
const Metalsmith = require('metalsmith');
const plantuml = require('node-plantuml');
const getStream = require('get-stream');
const uml = require('..');

const fileContent = async (name) => (await readFile(resolve(name)))
  .toString();

const PROJECT_DIR = 'spec/fixtures/plantuml';

const genUml = async (text) => {
  const gen = plantuml.generate(text, { format: 'svg' });
  return getStream(gen.out);
};

const TITMEOUT = 20000;

describe('metalsmith-plantuml', () => {
  describe('codeBlocks active', () => {
    beforeEach((done) => Metalsmith(PROJECT_DIR)
      .use(uml())
      .build(done), TITMEOUT);

    it('should inline PlantUML diagram an SVG in markdown', async () => {
      const file = await fileContent('spec/fixtures/plantuml/build/index.md');
      expect(file).toContain('<svg');
      expect(file).toContain('</svg>');

      [
        '<svg',
        '</svg>',
        'Woody',
        'Lightyear',
        'friends',
        'Peep',
        'Potato',
        'Hello',
      ].forEach((text) => {
        expect(file).toContain(text);
      });
    });
  });

  describe('codeBlocks disabled', () => {
    beforeEach((done) => Metalsmith(PROJECT_DIR)
      .use(uml({ codeBlocks: false }))
      .build(done), TITMEOUT);

    it('should not inline PlantUML svg', async () => {
      const file = await fileContent('spec/fixtures/plantuml/build/index.md');
      [
        '<svg',
        '</svg>',
      ].forEach((text) => {
        expect(file).not.toContain(text);
      });
    }, TITMEOUT);
  });

  describe('plantum files', () => {
    beforeEach((done) => Metalsmith(PROJECT_DIR)
      .use(uml())
      .build(done), TITMEOUT);

    it('should convert plantuml files to SVG', async () => {
      const file = await fileContent('spec/fixtures/plantuml/build/a-to-b.svg');
      const PLANTUML = (await genUml(`
        @startuml
          A -> B: Hello
        @enduml
      `)).slice(0, 100);
      expect(file).toContain(PLANTUML);
      expect(file).toContain('A</text>');
      expect(file).toContain('B</text>');
      expect(file).toContain('Hello</text>');
    }, TITMEOUT);
  });
});
