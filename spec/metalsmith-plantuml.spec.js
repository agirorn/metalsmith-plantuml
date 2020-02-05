const { readFile } = require('fs').promises;
const { resolve } = require('path');
const Metalsmith = require('metalsmith');
const plantuml = require('node-plantuml');
const getStream = require('get-stream');
const uml = require('..');

const fileContent = async (name) => (await readFile(resolve(name)))
  .toString();

const FIRST_SVG_UML = [
  '![plantuml](data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZ',
  'z0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcv',
  'MjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb25',
  '0ZW50U2NyaXB0VHlwZT0iYXBwbGljYXRpb24vZWNtYXNjcmlwdCIgY29udGVudFN0eWxlVHlwZT',
  '0idGV4dC9jc3MiIGhlaWdodD0iMTI4cHgiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHN0e',
  'WxlPSJ3aWR0aDo5OXB4O2hlaWdodDoxMjhweDsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAw',
  'IDk5IDEyOCIgd2lkdGg9Ijk5cHgiIHpvb21BbmRQYW49Im1hZ25',
].join('');

const SECOND_SVG_UML = [
  '![plantuml](data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZ',
  'z0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcv',
  'MjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb25',
  '0ZW50U2NyaXB0VHlwZT0iYXBwbGljYXRpb24vZWNtYXNjcmlwdCIgY29udGVudFN0eWxlVHlwZT',
  '0idGV4dC9jc3MiIGhlaWdodD0iMTI4cHgiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHN0e',
  'WxlPSJ3aWR0aDoxMDBweDtoZWlnaHQ6MTI4cHg7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAg',
  'MCAxMDAgMTI4IiB3aWR0aD0iMTAwcHgiIHpvb21BbmRQYW49Im1',
].join('');

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

    it('should inline PlantUML diagram as base64 encoded SVG in markdown', async () => {
      const file = await fileContent('spec/fixtures/plantuml/build/index.md');
      expect(file).toContain(FIRST_SVG_UML);
      expect(file).toContain(SECOND_SVG_UML);
    }, TITMEOUT);
  });

  describe('codeBlocks disabled', () => {
    beforeEach((done) => Metalsmith(PROJECT_DIR)
      .use(uml({ codeBlocks: false }))
      .build(done), TITMEOUT);

    it('should not inline PlantUML diagram in markdown', async () => {
      const file = await fileContent('spec/fixtures/plantuml/build/index.md');
      expect(file).not.toContain(FIRST_SVG_UML);
      expect(file).not.toContain(SECOND_SVG_UML);
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
      `)).slice(0, 383);
      expect(file).toContain(PLANTUML);
    }, TITMEOUT);
  });
});
