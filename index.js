#!/usr/bin/env node

require("events").EventEmitter.prototype._maxListeners = 500;
require("commander").version("1.0.3");

const Octokit = require("@octokit/rest");
const shell = require("shelljs");
const inquirer = require("inquirer");

const clone = (data, answers) => {
  shell.mkdir("-p", answers.user);
  shell.cd(answers.user);
  data.forEach(r => {
    shell.exec(
      `git clone https://${answers.token}@github.com/${r.full_name}.git`,
      { async: true }
    );
  });
};

if (!shell.which("git")) {
  shell.echo("Sorry, this script requires git");
  shell.exit(1);
}

inquirer
  .prompt([
    {
      type: "list",
      name: "type",
      message: "Clone repos of user or organization?",
      choices: ["user", "organization"]
    },
    {
      type: "input",
      name: "user",
      message: "Name of the user/organization"
    },
    {
      type: "input",
      name: "token",
      message: "Your Github Access Token (optional for private repos)"
    }
  ])
  .then(answers => {
    const params = {};
    if (answers.token !== "") {
      params["auth"] = answers.token;
    }
    try {
      if (answers.type === "organization") {
        new Octokit(params).repos
          .listForOrg({ org: answers.user })
          .then(({ data }) => clone(data, answers));
      } else if (answers.type === "user") {
        new Octokit(params).repos
          .listForUser({ username: answers.user })
          .then(({ data }) => clone(data, answers));
      }
    } catch (e) {
      console.error(e);
    }
  });
