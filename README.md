![CI](https://github.com/shufo/auto-assign-reviewer-by-assignee/workflows/CI/badge.svg)

# Auto Assign Reviewer By Files

A Github Action that automatically assigns reviewers to PR based on changed files

## Configuration

create configuration file

`.github/assign-by-files.yml`

```yaml
---
# you can use glob pattern
"**/*.js":
  - shufo

".github/workflows/*.yml":
  - shufo2

# you can set multiple reviewers
".github/**/*.yml":
  - foo
  - bar
```

Glob matching is based on the [minimatch library](https://github.com/isaacs/minimatch).

create action file

`.github/workflows/auto-assign.yml`

```yaml
name: "Auto Assign"
on:
  - pull_request

jobs:
  assign_reviewer:
    runs-on: ubuntu-latest
    steps:
      - uses: shufo/auto-assign-reviewer-by-files@v1.1.2
        with:
          config: ".github/assign-by-files.yml"
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Example

![image](https://user-images.githubusercontent.com/1641039/80326369-7ee86f00-8873-11ea-9769-887b083575ad.png)

## Troubleshooting

#### Does not match any files

- Please check if glob pattern is correct or not

```yaml
# it will matches only js files under the root directory
"*.js":
  - foo
# it will matches `.github/foo.yaml` but not `.github/workflows/bar.yaml`
".github/*":
  - bar
# it will match any files
"**/*":
  - shufo
```
