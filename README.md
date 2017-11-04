![travis](https://travis-ci.org/icd2k3/react-router-breadcrumbs-hoc.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/icd2k3/react-router-breadcrumbs-hoc/badge.svg?branch=master)](https://coveralls.io/github/icd2k3/react-router-breadcrumbs-hoc?branch=master)

<h3 align="center">
  React Router Breadcrumbs HOC
</h3>

<p align="center">
  A very small, but flexible HOC for rendering breadcrumbs with react-router 4.x
</p>

<p align="center">
  http://site.com/user/id → user / John Doe
</p>

## Description

Deconstruct a route and return matching breadcrumb components you can render however you like. Render a simple string, a component that fetches a model in order to display the desired content, or just render something totally unrelated to the route.

We are currently using this method @ [Koan Inc.](https://koan.co)

## Install

`yarn add react-router-breadcrumbs-hoc` or `npm install react-router-breadcrumbs-hoc --save`

## Usage

```js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { withBreadcumbs } from 'react-router-breadcrumbs-hoc';

const UserBreadcrumb = ({ match }) =>
  <span>{match.params.userId}</span>; // use match param userId to fetch/display user name

const routes = [
  { path: 'users', breadcrumb: 'Users' },
  { path: 'users/:userId', breadcrumb: UserBreadcrumb},
  { path: 'something-else', breadcrumb: ':)' },
];

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
/users | Users
/users/id | Users / John
/something-else | :)

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
getBreadcrumbs({ routes: Array<Route>, pathname: String }): Array<Breadcrumb>
```

### Thanks
- [Koan Inc.](https://koan.co)
- [rjz](https://github.com/rjz)
- [sqren](https://github.com/sqren)
