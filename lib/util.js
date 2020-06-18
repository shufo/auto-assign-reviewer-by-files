const yaml = require("yaml");
const _ = require("lodash");

const parseConfig = function (content) {
  var r = yaml.parse(content);
  console.log(r);
  if(r == []) {
    throw "config is empty or unparseable"
  }
  return r;
};

const getReviewers = function (config, assignee) {
  const matched = _.findKey(config, (_, key) => {
    return assignee.match(new RegExp(key));
  });

  if (matched) {
    return config[matched];
  }

  return [];
};

module.exports = {
  parseConfig: parseConfig,
  getReviewers: getReviewers,
};
