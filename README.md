# resolve-package-json

Resolve package.json dependency versions

## Installation

```
$ npm install --save resolve-package-json
```

## Usage

``` js
const { resolver } = require('resolve-package-json')
const pkg = require('./package.json')

resolver(pkg.dependencies, function (err, result) {
  if (err) throw err

  console.log(result)
})
```

## Acknowledgements

Dependency resolution algorithm is inspired from [dep](https://github.com/watilde/dep)

## Authors and Contributors

<table><tbody>
<tr><th align="left">Julián Duque</th><td><a href="https://github.com/julianduque">GitHub/julianduque</a></td><td><a href="http://twitter.com/julian_duque">Twitter/@julian_duque</a></td></tr>
</tbody></table>

Contributions are welcomed from anyone wanting to improve this project!

## License & Copyright

**nscm** is Copyright (c) 2017 NodeSource and licensed under the MIT license. All rights not explicitly granted in the MIT license are reserved. See the included [LICENSE.md](https://github.com/nodesource/resolve-package-json/blob/master/LICENSE.md) file for more details.

