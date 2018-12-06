

## Pull Requests

### Step 1: Fork the project

Fork the project [on GitHub](https://github.com/aerogear/apollo-voyager-server) and clone your fork
locally.

```text
$ git clone git@github.com:username/apollo-voyager-server.git
$ cd apollo-voyager-server
$ git remote add upstream https://github.com/aerogear/apollo-voyager-server.git
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

A good commit message should describe what changed and why.

1. The first line should
  
    - Be prefixed with one of `fix(module):`, `feat(module):`, or `breaking(module):`, where `fix` represents a semver patch change, `feat` represents a semver minor change and `breaking` represents a semver major change.
    - `module` should reference the affected module. All our module names follow the convention `apollo-voyager-<name>`. `module` should be the `<name>` part only.
    - Contain a short description of the change in all lowercase characters. Try to keep the first line shorter tham 100 characters.

    Examples:

    - fix(server): add new options to ApolloVoyagerServerOptions interface
    - feat(keycloak): add RBAC feature to keycloak package.

    Please note you can also choose from one of the following if you think one is more appropriate:

    - `doc`: Documentation only changes
    - `test`: Adding missing tests or correcting existing tests
    - `refactor`: A code change that neither fixes a bug nor adds a feature
    - `ci`: Changes to our CI configuration files and scripts.

2. Keep the second line blank

3. Try to keep all lines under 100 characters

4. If your commit fixes an open issue, you can add a reference to it at the end of the log.

    Examples:

      - Fixes: https://issues.jboss.org/browse/AEROGEAR-8195
      - Refs: https://issues.jboss.org/browse/AEROGEAR-8195

5. If your commit introduces a breaking change (Semver Major), your commit message
should explain what the breaking change is, the reason it was introduced, and which
situation would trigger the breaking change.

Sample complete commit message:

```txt
fix(module): explain the commit in one line

Body of commit message is a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc.

Body of commit message may have multiple paragraphs if you wish.
Please make sure the paragraphs are under 100 characters.

Fixes: https://issues.jboss.org/browse/AEROGEAR-8192
Refs: https://issues.jboss.org/browse/AEROGEAR-8193
```

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

Contributors guide: https://github.com/aerogear/apollo-voyager-server/blob/master/CONTRIBUTING.md
-->

### Description

<!-- Please provide a description of your pull request -->

##### Checklist
<!-- Remove items that do not apply. For completed items, change [ ] to [x]. -->

- [ ] `npm test` passes
- [ ] tests are included
- [ ] documentation is changed or added
- [ ] commit message follows [commit guidelines](https://github.com/aerogear/apollo-voyager-server/blob/master/CONTRIBUTING.md#commit-message-guidelines)
```

Please try to do your best at filling out the details, but feel free to skip
parts if you're not sure what to put.
