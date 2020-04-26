const core = require("@actions/core");
const github = require("@actions/github");
const context = github.context;
const { parseConfig } = require("./lib/util");
const _ = require("lodash");
const { Minimatch } = require("minimatch");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const octokit = new github.GitHub(token);
    const token = core.getInput("token", { required: true });
    const configPath = core.getInput("config");

    const configContent = await fetchContent(octokit, configPath);
    const config = parseConfig(configContent);

    core.debug("config");
    core.debug(JSON.stringify(config));

    const { data: pullRequest } = await octokit.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number,
      reviewers: [],
    });

    const changedFiles = getChangedFiles(octokit, pullRequest.number);

    _.each(_.keys(config), (globPattern) => {
      if (hasGlobPatternMatchedFile(changedFiles, globPattern)) {
        let reviewers = config["globPattern"];
        assignReviewers(octokit, reviewers);
      }
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function fetchContent(client, repoPath) {
  const response = await client.repos.getContents({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: repoPath,
    ref: github.context.sha,
  });

  return Buffer.from(response.data.content, response.data.encoding).toString();
}

async function getChangedFiles(client, prNumber) {
  const listFilesResponse = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  const changedFiles = listFilesResponse.data.map((f) => f.filename);

  core.debug("found changed files:");
  for (const file of changedFiles) {
    core.debug("  " + file);
  }

  return changedFiles;
}

function hasGlobPatternMatchedFile(changedFiles, globPattern) {
  for (const changedFile in changedFiles) {
    if (Minimatch(changedFile, globPattern)) {
      return true;
    }
  }

  return false;
}

async function assignReviewers(octokit, reviewers) {
  await octokit.pulls.createReviewRequest({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request.number,
    reviewers: reviewers,
  });
}

run();
