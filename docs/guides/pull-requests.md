

## Pull Requests

### Step 1: Fork the project

Fork the project [on GitHub](https://github.com/aerogear/voyager-server) and clone your fork
locally.

```text
$ git clone git@github.com:username/voyager-server.git
$ cd voyager-server
$ git remote add upstream https://github.com/aerogear/voyager-server.git
$ git fetch upstream
```

It is recommended to configure `git` so that it knows who you are:

```text
$ git config user.name "J. Random User"
$ git config user.email "j.random.user@example.com"
```

This will help us add your details to our list of contributors and to our changelog.

### Step 2: Create a New Branch

As a best practice to keep your development environment as organized as
possible, create local branches to work within. These should also be created
directly off of the `master` branch.

```text
$ git checkout -b my-branch -t upstream/master
```

## The Process of Making Changes

### Step 3: Code

To learn how to make changes, build and test our code, please follow our [Local Development Guide](./local-development.md).

### Step 4: Commit

It is a recommended best practice to make small individual commits. There is no limit to the number of
commits any single Pull Request may have, and some contributors find it easier
to review changes that are split across multiple commits.

```text
$ git add my/changed/files
$ git commit
```

Note that multiple commits often get squashed by mainteiners when they are landed.

## Commit Message Guidelines

This project has rules for commit messages (loosely based on [Conventional Commits](https://conventionalcommits.org/)).

### Commit Message Format

We like short commit messages. But we also like some structure. It's very simple.

Simply add add one of `fix:`, `feat:`, `breaking:` to the beginning of your commit.

Examples:

  - fix: ensure server starts correctly
  - feat: add RBAC feature to keycloak module.
  - breaking: renamed voyager server constructor

The reasons for this are as follows:

* Commit messages are more readable, especially when looking through the **project history**.
* Commit messages describe whether a major, minor or patch change has been introduced (see [semver.org](https://semver.org/))
* Commit messages can be used to generate a changelog.

Please note you can also choose from one of the following key words if you think one is more appropriate.

- `doc`: Documentation only changes
- `test`: Adding missing tests or correcting existing tests
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `ci`: Changes to our CI configuration files and scripts.

### Step 5: Rebase

As a best practice, once you have committed your changes, it is a good idea
to use `git rebase` to synchronize your work with the main
repository.

```text
$ git fetch upstream
$ git rebase upstream/master
```

### Step 6: Test

<!-- TODO: Once we have more testing in place, it would be nice to have a better guide on tests -->
Bug fixes and features should always come with tests. This repo mostly contains `unit` and `integration` tests.
Unit tests are typically placed in the same directory as the code they are testing.
Looking at other tests to see how they should be structured can help you write tests.

Before submitting your changes in a Pull Request, always run the full test suite and lint the code.

```
$ npm test
$ npm run lint
```

### Step 7: Push

Once you are sure your commits are ready to go, with passing tests and linting,
begin the process of opening a Pull Request by pushing your working branch to
your fork on GitHub.

```text
$ git push origin my-branch
```

### Step 8: Opening the Pull Request

From within GitHub, opening a new Pull Request will present you with a template
that should be filled out:

```markdown
<!--
Thank you for your pull request. Please provide a description above and review
the requirements below.

Bug fixes and new features should include tests.

Contributors guide: https://github.com/aerogear/voyager-server/blob/master/CONTRIBUTING.md
-->

### Description

<!-- Please provide a description of your pull request -->

##### Checklist
<!-- Remove items that do not apply. For completed items, change [ ] to [x]. -->

- [ ] `npm test` passes
- [ ] tests are included
- [ ] documentation is changed or added
- [ ] commit message follows [commit guidelines](https://github.com/aerogear/voyager-server/blob/master/CONTRIBUTING.md#commit-message-guidelines)
```

Please try to do your best at filling out the details, but feel free to skip
parts if you're not sure what to put.
