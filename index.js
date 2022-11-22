const core = require("@actions/core");
const github = require("@actions/github");
const context = github.context;
const { parseConfig } = require("./lib/util");
const _ = require("lodash");
var Minimatch = require("minimatch");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const token = core.getInput("token", { required: true });
    const configPath = core.getInput("config");
    const octokit = new github.GitHub(token);

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

    const changedFiles = await getChangedFiles(octokit, pullRequest.number);
    const author = pullRequest.user.login;

    var reviewers = new Set();
    _.each(_.keys(config), (globPattern) => {
      if (hasGlobPatternMatchedFile(changedFiles, globPattern)) {
        console.log(config[globPattern], author);
        let newReviewers = _.pull(config[globPattern], author);
        for (const reviewer of newReviewers) {
          reviewers.add(reviewer);
        }
      }
    });
    assignReviewers(octokit, reviewers).catch((error) => {
      core.setFailed(error.message);
    });
    core.info("finished!");
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
  const listFilesResponse = [];
  let page = 1;
  let response;

  do {
    response = await client.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
      per_page: 100,
      page,
    });
    listFilesResponse.push(...response.data);
    page += 1;
  } while (response.data.length);

  const changedFiles = listFilesResponse.map((f) => f.filename);

  core.debug("found changed files:");
  for (const file of changedFiles) {
    core.debug("  " + file);
  }

  return changedFiles;
}

function hasGlobPatternMatchedFile(changedFiles, globPattern) {
  for (const changedFile of changedFiles) {
    if (Minimatch(changedFile, globPattern, { dot: true })) {
      core.info("  " + changedFile + " matches " + globPattern);
      return true;
    }
  }

  return false;
}

async function assignReviewers(octokit, reviewers) {
  for (const reviewer of reviewers) {
    await assignReviewer(octokit, reviewer);
  }
}

async function assignReviewer(octokit, reviewer) {
  let reviewerKey = "reviewers";
  let reviewerTarget = reviewer;

  if (_.isObject(reviewer) && _.has(reviewer, "team")) {
    reviewerKey = "team_reviewers";
    reviewerTarget = reviewer.team;
  }

  await octokit.pulls.createReviewRequest({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request.number,
    [reviewerKey]: [reviewerTarget],
  });
}

run();

module.exports = { hasGlobPatternMatchedFile };
