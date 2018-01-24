<h3 align="center">
  React Router Breadcrumbs HOC
</h3>

<p align="center">
  Just a tiny, flexible, <a href="https://reactjs.org/docs/higher-order-components.html">higher order component</a> for rendering breadcrumbs with <a href="https://github.com/ReactTraining/react-router">react-router</a> 4.x
</p>

<p align="center">
  site.com/user/id → user / John Doe
</p>

<p align="center">
  <a href="https://travis-ci.org/icd2k3/react-router-breadcrumbs-hoc" target="_blank"><img src="https://travis-ci.org/icd2k3/react-router-breadcrumbs-hoc.svg?branch=master" /></a>
  <a href="https://coveralls.io/github/icd2k3/react-router-breadcrumbs-hoc?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/icd2k3/react-router-breadcrumbs-hoc/badge.svg?branch=master" /></a>
  <a href="https://david-dm.org/icd2k3/react-router-breadcrumbs-hoc" title="dependencies status"><img src="https://david-dm.org/icd2k3/react-router-breadcrumbs-hoc/status.svg"/></a>
  <a href="https://david-dm.org/icd2k3/react-router-breadcrumbs-hoc?type=dev" target="_blank"><img src="https://david-dm.org/icd2k3/react-router-breadcrumbs-hoc/dev-status.svg" /></a>
</p>

## Description

Deconstruct a route and return matching breadcrumb components you can render however you like. Render a simple string, a component that fetches a model in order to display the desired content, or just render something totally unrelated to the route.

We are currently using this method @ [Koan Inc.](https://koan.co)

## Install

`yarn add react-router-breadcrumbs-hoc`

or

`npm install react-router-breadcrumbs-hoc --save`

## Usage

```js
withBreadcrumbs(routeConfigObject)(MyComponent);
```

## Example

```js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { withBreadcrumbs } from 'react-router-breadcrumbs-hoc';

const UserBreadcrumb = ({ match }) =>
  <span>{match.params.userId}</span>; // use match param userId to fetch/display user name

const routes = [
  { path: '/', breadcrumb: 'Home' },
  { path: '/users', breadcrumb: 'Users' },
  { path: '/users/:userId', breadcrumb: UserBreadcrumb },
  { path: '/something-else', breadcrumb: ':)' },
];

// map & render your breadcrumb components however you want
const Breadcrumbs = ({ breadcrumbs }) => (
  <div>
    {breadcrumbs.map(({ breadcrumb, path, match }) => (
      <span key={path}>
        <NavLink to={match.url}>
          {breadcrumb}
        </NavLink>
        <span>/</span>
      </span>
    ))}
  </div>
);

export default withBreadcrumbs(routes)(Breadcrumbs);
```

For the above example...

Pathname | Result
--- | ---
/users | Home / Users
/users/id | Home / Users / John
/something-else | Home / :)

## API

```js
Route = {
  path: String
  breadcrumb: String|Function
  matchOptions?: Object
}

Breadcrumb = {
  path: String
  match: String
  breadcrumb: Component
}

withBreadcrumbs(routes: Array<Route>): HigherOrderComponent

// you shouldn't ever really have to use `getBreadcrumbs`, but it's
// exported for convenience if you don't want to use the HOC
getBreadcrumbs({ routes: Array<Route>, pathname: String }): Array<Breadcrumb>
```

## Order Matters!

Consider the following route config:

```js
[
  { path: '/users', breadcrumb: 'Users' },
  { path: '/users/:id', breadcrumb: 'Users - id' },
  { path: '/users/create', breadcrumb: 'Users - create' },
]
```

This package acts like a switch statement and matches the first breadcrumb it can find. So, unfortunately, visiting `/users/create` will result in the `Users > Users - id` breadcrumbs instead of the desired `Users > Users - create` breadcrumbs.

To get the right breadcrumbs, simply change the order:

```js
[
  { path: '/users', breadcrumb: 'Users' },
  { path: '/users/create', breadcrumb: 'Users - create' },
  { path: '/users/:id', breadcrumb: 'Users - id' },
]
```

Now, `/users/create` will match the create breadcrumb first, and all others will fall through to `/:id`.
