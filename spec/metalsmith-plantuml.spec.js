const { readFile } = require('fs').promises;
const { resolve } = require('path');
const Metalsmith = require('metalsmith');
const uml = require('..');

const fileContent = async (name) => (await readFile(resolve(name)))
  .toString();

const FIRST_SVG_UML = [
  '![plantuml](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53M',
  'y5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hs',
  'aW5rIiBjb250ZW50U2NyaXB0VHlwZT0iYXBwbGljYXRpb24vZWNtYXNjcmlwdCIgY29udGV',
  'udFN0eWxlVHlwZT0idGV4dC9jc3MiIGhlaWdodD0iMTI3cHgiIHByZXNlcnZlQXNwZWN0Um',
  'F0aW89Im5vbmUiIHN0eWxlPSJ3aWR0aDo5OHB4O2hlaWdodDoxMjdweDsiIHZlcnNpb249I',
  'jEuMSIgdmlld0JveD0iMCAwIDk4IDEyNyIgd2lkdGg9Ijk4cHgiIHpvb21BbmRQYW49Im1h',
  'Z25pZnkiPjxkZWZzPjxmaWx0ZXIgaGVpZ2h0PSIzMDAlIiBpZD0iZjFyNjQ0emxiemN2c24',
  'iIHdpZHRoPSIzMDAlIiB4PSItMSIgeT0iLTEiPjxmZUdhdXNzaWFuQmx',
].join('');


const SECOND_SVG_UML = [
  '![plantuml](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53M',
  'y5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hs',
  'aW5rIiBjb250ZW50U2NyaXB0VHlwZT0iYXBwbGljYXRpb24vZWNtYXNjcmlwdCIgY29udGV',
  'udFN0eWxlVHlwZT0idGV4dC9jc3MiIGhlaWdodD0iMTI3cHgiIHByZXNlcnZlQXNwZWN0Um',
  'F0aW89Im5vbmUiIHN0eWxlPSJ3aWR0aDo5OXB4O2hlaWdodDoxMjdweDsiIHZlcnNpb249I',
  'jEuMSIgdmlld0JveD0iMCAwIDk5IDEyNyIgd2lkdGg9Ijk5cHgiIHpvb21BbmRQYW49Im1h',
  'Z25pZnkiPjxkZWZzPjxmaWx0ZXIgaGVpZ2h0PSIzMDAlIiBpZD0iZmh2emZjZGp5YmNvYSI',
  'gd2lkdGg9IjMwMCUiIHg9Ii0xIiB5PSItMSI+PGZlR2F1c3NpYW5CbHV',
].join('');

const PROJECT_DIR = 'spec/fixtures/plantuml';


describe('metalsmith-plantuml', () => {
  describe('codeBlocks active', () => {
    beforeEach((done) => Metalsmith(PROJECT_DIR)
      .use(uml())
      .build(done));

    it('new - should inline PlantUML diagram as base64 encoded SVG in markdown', async () => {
      const file = await fileContent('spec/fixtures/plantuml/build/index.md');
      expect(file).toContain(FIRST_SVG_UML);
      expect(file).toContain(SECOND_SVG_UML);
    });
  });

  describe('codeBlocks disabled', () => {
    beforeEach((done) => Metalsmith(PROJECT_DIR)
      .use(uml({ codeBlocks: false }))
      .build(done));

    it('new - should inline PlantUML diagram as base64 encoded SVG in markdown', async () => {
      const file = await fileContent('spec/fixtures/plantuml/build/index.md');
      expect(file).not.toContain(FIRST_SVG_UML);
      expect(file).not.toContain(SECOND_SVG_UML);
    });
  });
});
