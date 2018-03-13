<h3 align="center">
  React Router Breadcrumbs HOC
</h3>

<p align="center">
  A tiny (~2kb minified), flexible, <a href="https://reactjs.org/docs/higher-order-components.html">higher order component</a> for rendering breadcrumbs with <a href="https://github.com/ReactTraining/react-router">react-router</a> 4.x
</p>

<p align="center">
  site.com/user/id → Home / User / John Doe
</p>

<p align="center">
  <a href="https://travis-ci.org/icd2k3/react-router-breadcrumbs-hoc" target="_blank"><img src="https://travis-ci.org/icd2k3/react-router-breadcrumbs-hoc.svg?branch=master" /></a>
  <a href="https://coveralls.io/github/icd2k3/react-router-breadcrumbs-hoc?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/icd2k3/react-router-breadcrumbs-hoc/badge.svg?branch=master" /></a>
  <a href="https://david-dm.org/icd2k3/react-router-breadcrumbs-hoc" title="dependencies status"><img src="https://david-dm.org/icd2k3/react-router-breadcrumbs-hoc/status.svg"/></a>
  <a href="https://codeclimate.com/github/icd2k3/react-router-breadcrumbs-hoc/maintainability"><img src="https://api.codeclimate.com/v1/badges/9f4bd022e2a21f40fc3a/maintainability" /></a>
</p>

## Description

Deconstruct a route and return matching breadcrumb components you can render however you like. Render a simple string, a component that fetches a model in order to display the desired content, or just render something totally unrelated to the route.

We are currently using this method @ [Koan Inc.](https://koan.co)

**Note:** Upgrading from `1.x.x` to `2.x.x`? Check out the guide [here](https://github.com/icd2k3/react-router-breadcrumbs-hoc/blob/master/MIGRATIONS.md)

## Install

`yarn add react-router-breadcrumbs-hoc`

or

`npm install react-router-breadcrumbs-hoc --save`

## Usage

```js
withBreadcrumbs()(MyComponent);
```

## Simple example

```js
import React from 'react';
import { NavLink } from 'react-router-dom';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

// breadcrumbs can be any type of component or string
const UserBreadcrumb = ({ match }) =>
  <span>{match.params.userId}</span>; // use match param userId to fetch/display user name

// define some custom breadcrumbs for certain routes (optional)
const routes = [
  { path: '/users/:userId', breadcrumb: UserBreadcrumb },
  { path: '/example', breadcrumb: 'Custom Example' },
];

// map & render your breadcrumb components however you want.
// each `breadcrumb` has the props `key`, `location`, and `match` included!
const Breadcrumbs = ({ breadcrumbs }) => (
  <div>
    {breadcrumbs.map((breadcrumb, index) => (
      <span key={breadcrumb.props.key}>
        <NavLink to={breadcrumb.props.match.url}>
          {breadcrumb}
        </NavLink>
        {(index < breadcrumbs.length - 1) && <i> / </i>}
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
/example | Home / Custom Example

## Dynamic Breadcrumbs

If you pass a component as the `breadcrumb` prop it will be injected with react-router's [match](https://reacttraining.com/react-router/web/api/match) and [location](https://reacttraining.com/react-router/web/api/location) objects as props. These objects contain ids, hashes, queries, etc from the route that will allow you to map back to whatever you want to display in the breadcrumb.

Let's use Redux as an example with the [match](https://reacttraining.com/react-router/web/api/match) object:

```js
// UserBreadcrumb.jsx
const PureUserBreadcrumb = ({ firstName }) => <span>{firstName}</span>;

// find the user in the store with the `id` from the route
const mapStateToProps = (state, props) => ({
  firstName: state.userReducer.usersById[props.match.params.id].firstName,
});

export default connect(mapStateToProps)(PureUserBreadcrumb);

// routes = [{ path: '/users/:id', breadcrumb: UserBreadcrumb }]
// example.com/users/123 --> Home / Users / John
```

Similarly, the [location](https://reacttraining.com/react-router/web/api/location) object could be useful for displaying dynamic breadcrumbs based on the route's state:

```jsx
// dynamically update Breadcrumb based on state info
const EditorBreadcrumb = ({ location: { state: { isNew } } }) => (
  <span>{isNew ? 'Add New' : 'Update'}</span>
);

// routes = [{ path: '/editor', breadcrumb: EditorBreadcrumb }]

// upon navigation, breadcrumb will display: Update
<Link to={{ pathname: '/editor' }}>Edit</Link>

// upon navigation, breadcrumb will display: Add New
<Link to={{ pathname: '/editor', state: { isNew: true } }}>Add</Link>
```

## Already using a [route config](https://reacttraining.com/react-router/web/example/route-config) array with react-router?

Just add a `breadcrumb` prop to your routes that require custom breadcrumbs.

## Disabling default breadcrumbs for paths

This package will attempt to create breadcrumbs for you based on the route section via [humanize-string](https://github.com/sindresorhus/humanize-string). For example `/users` will auotmatically create the breadcrumb `"Users"`. There are two ways to disable default breadcrumbs for a path:

Pass `breadcrumb: null` in the routes config:

`{ path: '/a/b', breadcrumb: null }`

Or, Pass an `excludePaths` array in the `options` object

`withBreadcrumbs(routes, { excludePaths: ['/', '/no-breadcrumb/for-this-route'] })` 

in your routes array.

## API

```js
Route = {
  path: String
  breadcrumb: String|Function? // note: if not provided, a default breadcrumb will be returned
  matchOptions?: Object
}

Options = {
  excludePaths: Array
}

// if routes are not passed, default breadcrumbs will be returned
withBreadcrumbs(routes?: Array<Route>, options? Object<Options>): HigherOrderComponent

// you shouldn't ever really have to use `getBreadcrumbs`, but it's
// exported for convenience if you don't want to use the HOC
getBreadcrumbs({
  routes: Array<Route>,
  location: Object<Location>, // react-router's location object: https://reacttraining.com/react-router/web/api/location
  options: Object<Options>,
}): Array<Breadcrumb>
```

## Order matters!

Consider the following route configs:

```js
[
  { path: '/users/:id', breadcrumb: 'id-breadcrumb' },
  { path: '/users/create', breadcrumb: 'create-breadcrumb' },
]

// example.com/users/create = 'id-breadcrumb' (because path: '/users/:id' will match first)
// example.com/users/123 = 'id-breadcumb'
```

To fix the issue above, just adjust the order of your routes:

```js
[
  { path: '/users/create', breadcrumb: 'create-breadcrumb' },
  { path: '/users/:id', breadcrumb: 'id-breadcrumb' },
]

// example.com/users/create = 'create-breadcrumb' (because path: '/users/create' will match first)
// example.com/users/123 = 'id-breadcrumb'
```
