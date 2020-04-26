const { parseConfig } = require("../lib/util");
const fs = require("fs");
const configFilePath = ".github/assign-by-files.yml";
const { Minimatch } = require("minimatch");

test("config parser", async () => {
  const content = fs.readFileSync(__basedir + "/" + configFilePath, {
    encoding: "utf8",
  });
  const config = parseConfig(content);
  expect(config["*.js"]).toMatchObject(["shufo"]);
});

test("glob pattern test", async () => {
  const matched = Minimatch('.github/auto-assign.yml', '.github/**/*.yml');
  expect(matched).toBeTruthy();
});
