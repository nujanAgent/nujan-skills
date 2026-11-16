# Security policy

## Reporting a problem

Please report a security problem privately, through GitHub's private vulnerability reporting: on this repository, open
the **Security and quality** tab and click **Report a vulnerability**, or go to
https://github.com/nujanAgent/nujan-skills/security/advisories/new. GitHub describes the form in
[Privately reporting a security vulnerability](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/report-privately).

Do not report a security problem in a public issue, discussion or pull request.

This repository covers the skills and the validator. Examples of what to report:

- a skill whose instructions could lead the model to act against the person using it, such as sending their data
  somewhere they did not choose;
- a skill that passes the validator while breaking the rules in [CONTRIBUTING.md](CONTRIBUTING.md).

A useful report names the skill and the commit, gives the request that shows the problem, and describes the impact.
A report is acknowledged within 7 days, and within 30 days it has a fix or a plan with a date. A fix is made in the skill and
recorded in the commit history.
