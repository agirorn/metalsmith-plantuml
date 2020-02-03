const { readFile } = require('fs').promises;
const { resolve } = require('path');
const Metalsmith = require('metalsmith');
const uml = require('..');

const fileContent = async (name) => (await readFile(resolve(name)))
  .toString();

describe('metalsmith-plantuml', () => {
  beforeEach((done) => Metalsmith('spec/fixtures/plantuml')
    .use(uml({}))
    .build(done));

  it('should inline PlantUML diagram as base64 encoded SVG in markdown', async () => {
    expect(await fileContent('spec/fixtures/plantuml/build/index.md'))
      .toEqual(await fileContent('spec/fixtures/plantuml/expected/index.md'));
  });
});
