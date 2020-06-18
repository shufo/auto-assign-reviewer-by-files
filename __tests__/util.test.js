const { parseConfig } = require("../lib/util");
const fs = require("fs");
const configFilePath = "assign-by-files-sample.yml";
var Minimatch  = require("minimatch");

test("config parser", async () => {
  const content = fs.readFileSync(__basedir + "/__tests__/" + configFilePath, {
    encoding: "utf8",
  });
  const config = parseConfig(content);
  expect(config["*.js"]).toMatchObject(["someone"]);
});

test("glob pattern test", async () => {
  const matched = Minimatch('.github/auto-assign.yml', '.github/**/*.yml');
  expect(matched).toBeTruthy();
});

test("glob pattern test", async () => {
  const matched = Minimatch('.github/workflows/unit-test.yml', "*.md");
  expect(!matched).toBeTruthy();
});
