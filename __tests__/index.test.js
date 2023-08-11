const { hasGlobPatternMatchedFile } = require("../index");

test("glob pattern test with dot files #23", async () => {
  const matched = hasGlobPatternMatchedFile([".github/auto-assin.yml"], "**/*.*");
  expect(matched).toBeTruthy();
});

test("glob pattern test with dot files #23", async () => {
  const matched = hasGlobPatternMatchedFile(
    [".github/auto-assin.yml"],
    "**/*.*"
  );
  expect(matched).toBeTruthy();
});
