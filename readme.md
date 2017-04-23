<!-- TITLE/ -->

<h1>PGQueryBuilder</h1>

<!-- /TITLE -->


<!-- BADGES/ -->



<!-- /BADGES -->


<!-- DESCRIPTION/ -->

A query builder made only for postgres

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>NPM</h3></a><ul>
<li>Install: <code>npm install --save pg-query-builder</code></li>
<li>Module: <code>require('pg-query-builder')</code></li></ul>

<!-- /INSTALL -->


## Usage
```js
const QueryBuilder = require('pg-query-builder')

const query = QueryBuilder()

/* simple example */
const sql =query('users')
  .select('name')
  .where('name', 'ILIKE', '%Olsen%')
  .toString()


/* using multi conditions */
const sql =query('users')
  .where({ confirmed: true, username: 'fireneslo' })
  .toString()

/* using joins */
const sql =query('users')
  .join('posts', 'user_id')
  .toString()


```

<!-- HISTORY/ -->

<h2>History</h2>

<a href="https://github.com/FireNeslo/pg-query-builder/releases">Discover the release history by heading on over to the releases page.</a>

<!-- /HISTORY -->


<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; <a href="https://github.com/FireNeslo">Øystein Ø. Olsen</a></li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
