const { parseConfig } = require("../lib/util");
const fs = require("fs");
var Minimatch  = require("minimatch");

test("config parser", async () => {
  const content = fs.readFileSync(__basedir + "/__tests__/assign-by-files-sample.yml", {
    encoding: "utf8",
  });
  const config = parseConfig(content);
  expect(config["*.js"]).toMatchObject(["someone"]);
});

test("bad config parser", async () => {
  const content = fs.readFileSync(__basedir + "/__tests__/assign-by-files-dup.yml", {
    encoding: "utf8",
  });
  try {
    const config = parseConfig(content);
    fail("exception expected");
  } catch(error) {
  }
});

test("glob pattern test", async () => {
  const matched = Minimatch('.github/auto-assign.yml', '.github/**/*.yml');
  expect(matched).toBeTruthy();
});

test("glob pattern test", async () => {
  const matched = Minimatch('.github/workflows/unit-test.yml', "*.md");
  expect(!matched).toBeTruthy();
});
