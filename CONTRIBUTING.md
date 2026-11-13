# Contributing

New skills, fixes to existing skills, and reports of skills that misbehave are welcome.

## Issues

- Search the existing issues first.
- For a skill that does the wrong thing, name the skill, give the request you sent and what NuJan did, and say which
  model was answering. A skill that fires on requests it is not for, or misses ones it is for, is a bug too.
- Open an issue before a large change to an existing skill, so that the approach is agreed before the work starts.
- Report security problems privately, as [SECURITY.md](SECURITY.md) describes, not in an issue.

## Adding or changing a skill

1. Fork the repository and add the skill as a folder under `skills/`, in the format [docs/FORMAT.md](docs/FORMAT.md)
   describes. A skill you made in NuJan can start from the file **share** saves under **Skills**: unzipped, it is the
   skill's folder.
2. Run the validator and fix what it reports:

   ```sh
   node tools/validate.mjs skills
   ```

3. Install the skill in NuJan from your fork and try it on the requests it is for, and on some it is not for.
4. Open a pull request that says what the skill does, which requests you tried it on, and with which model.

Keep a pull request to one skill. A change to an existing skill should say what it fixes and show the request that went
wrong before the change.

## What a skill may and may not do

A skill may:

- give the model a procedure for a kind of request, in its own words;
- name the NuJan tools the procedure uses;
- describe what good output looks like, and what to check before answering.

A skill may not:

- claim tools or permissions for itself, or ask the model to work around a refusal, a permission prompt or a setting
  the person chose;
- send what the person says, or what NuJan holds, to a destination of the skill's choosing;
- carry `allowed-tools` in its frontmatter, or a line that some agents run as a shell command (see
  [docs/FORMAT.md](docs/FORMAT.md));
- carry credentials, personal data, or text you do not have the right to share;
- automate a particular website's sign-in, purchase or posting steps;
- give medical, legal or financial instructions as if they came from a professional.

New scripted skills (tier 2) are not accepted at present.

## Developer Certificate of Origin

Every commit in a pull request is signed off, which certifies the
[Developer Certificate of Origin](https://developercertificate.org/): that you wrote the change, or otherwise have the
right to submit it under this repository's license. Sign off with `git commit -s`, which adds a line such as:

```
Signed-off-by: Your Name <you@example.com>
```

Do not submit text copied from another skill or document unless its license allows it to be distributed under the
Apache License 2.0, and say where it came from in the pull request.

## License

Unless you state otherwise, a contribution you submit for inclusion is licensed under the Apache License 2.0, as
section 5 of the [license](LICENSE) provides.
