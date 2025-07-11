import {Parser, fromFile} from "@asyncapi/parser"
import Generator from "@asyncapi/generator"
import fs from "node:fs/promises"

const parser = new Parser();

const testCases: {
  folder: string,
  value: string|boolean,
  expectedFolderLength: number,
  expectedFileIsUnder1MB: boolean,
}[] = [
  {
    folder: 'singleFileTrueString',
    value: 'true',
    expectedFolderLength: 1,
    expectedFileIsUnder1MB: false,
  },
  {
    folder: 'singleFileTrueBool',
    value: true,
    expectedFolderLength: 1,
    expectedFileIsUnder1MB: false,
  },
  {
    folder: 'singleFileFalseString',
    value: 'false',
    expectedFolderLength: 3,
    expectedFileIsUnder1MB: true,
  },
  {
    folder: 'singleFileFalseBool',
    value: false,
    expectedFolderLength: 3,
    expectedFileIsUnder1MB: true,
  },
];

// make sure ./docs/ exists and is empty on every run
await fs.rm(`./docs/`, {recursive: true, force: true});
await fs.mkdir('./docs', {})

// create test folders
for (const tc of testCases) {
  await fs.mkdir(`./docs/${tc.folder}`);
}

// parse asyncapi yaml file
const {document, diagnostics} = await fromFile(parser, './demo-api.yaml').parse();
if (!document) {
  console.error(diagnostics);
  throw new Error(`Failed to parse API yaml`);
}

// generate html (+ css and JS, if not singleFile)
for (const tc of testCases) {
  const gen = new Generator('@asyncapi/html-template', `./docs/${tc.folder}`, {forceWrite: true, templateParams: {singleFile: tc.value}});
  await gen.generate(document, {});
}

console.log('\n----- TEST FAILURES -----')
for (const tc of testCases) {
  const folderInfo = await fs.readdir(`./docs/${tc.folder}`);
  if (folderInfo.length != tc.expectedFolderLength) {
    console.error(`${tc.folder} expected folder length to be ${tc.expectedFolderLength}, received ${folderInfo.length}`);
  }

  const fileInfo = await fs.stat(`./docs/${tc.folder}/index.html`);
  if (tc.expectedFileIsUnder1MB && fileInfo.size > 1_000_000) {
    console.error(`${tc.folder} expected index.html to be under 1MB, received ${(fileInfo.size/1_000_000).toFixed(2)}MB`);
  }
  if (!tc.expectedFileIsUnder1MB && fileInfo.size < 1_000_000) {
    console.error(`${tc.folder} expected index.html to be over 1MB, received ${(fileInfo.size/1_000_000).toFixed(2)}MB`);
  }
}