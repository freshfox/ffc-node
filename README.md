# Freshfox Core Node

> is framework written in [Typescript][1] 

## Release

    npm version <major|minor|patch>

## Configure Typescript Mocha tests in WebStorm/Intellij

```$xslt
Working directory: <project root>
Environment variables:
	NODE_ENV=test

User interface: bdd
Extra Mocha options: --opts test/mocha.ts.opts
```

use ```mocha.ts.opts``` from this repository

[1]: https://www.typescriptlang.org/
