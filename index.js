#!/usr/bin/env node
require("events").EventEmitter.prototype._maxListeners = 100;
require("commander").version("1.0.1");
const Octokit = require("@octokit/rest");
const shell = require("shelljs");
const inquirer = require("inquirer");

inquirer
  .prompt([
    {
      type: "input",
      name: "organization",
      message: "Github Organization Name"
    },
    { type: "input", name: "token", message: "Your Github Access Token" }
  ])
  .then(answers => {
    if (!shell.which("git")) {
      shell.echo("Sorry, this script requires git");
      shell.exit(1);
    }
    const octokit = new Octokit({ auth: answers.token });
    octokit.repos.listForOrg({ org: answers.organization }).then(({ data }) => {
      shell.mkdir("-p", answers.organization);
      shell.cd(answers.organization);
      data.forEach(r => {
         shell.exec(`git clone https://${answers.token}@github.com/${r.full_name}.git`, { async: true });
      });
    });
  });
