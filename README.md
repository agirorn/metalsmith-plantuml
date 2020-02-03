# metalsmith-plantuml

A Metalsmith plugin that inlines PlantUML code blocks as SVG images in Markdown files

## Installation

```bash
$ npm install metalsmith-plantuml
```

## CLI Usage

Install then add the `metalsmith-plantuml` key to your `metalsmith.json` (please remember he
order is important, PlantUML must be processed before Markdown)

```json
{
  "plugins": {
    "metalsmith-plantuml": {},
    "metalsmith-markdonw": {}
  }
}
```

## Javascript Usage

Create a Metalsmith build file with PlantUML in markdown (please remember he
order is important, PlantUML must be processed before Markdown)

```js
const plantuml = require('metalsmith-plantuml');
const markdown = require('metalsmith-markdown');

metalsmith
  .use(plantuml())
  .use(markdown({
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
  }));
```

## License

MIT
