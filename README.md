<h3 align="center">
  React Router Breadcrumbs HOC
</h3>

<p align="center">
  <a href="https://github.com/icd2k3/react-router-breadcrumbs-hoc/actions" target="_blank"><img src="https://github.com/icd2k3/react-router-breadcrumbs-hoc/workflows/Node.js%20CI/badge.svg?branch=master" /></a>
  <a href="https://david-dm.org/icd2k3/react-router-breadcrumbs-hoc" title="dependencies status"><img src="https://david-dm.org/icd2k3/react-router-breadcrumbs-hoc/status.svg"/></a>
  <a href="https://coveralls.io/github/icd2k3/react-router-breadcrumbs-hoc?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/icd2k3/react-router-breadcrumbs-hoc/badge.svg?branch=master" /></a>
</p>

<p align="center">
  A small (~1.3kb compressed & gzipped), flexible, <a href="https://reactjs.org/docs/higher-order-components.html">higher order component</a> for rendering breadcrumbs with <a href="https://github.com/ReactTraining/react-router">react-router</a> 5
</p>

<hr/>
  <h4 align="center">
    <code>
      example.com/user/123 → Home / User / John Doe
    </code>
  </h4>
<hr/>

<p align="center">
  <code>
    Want to use hooks instead? Try <a href="https://github.com/icd2k3/use-react-router-breadcrumbs">use-react-router-breadcrumbs</a>.
  </code>
</p>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
- [Description](#description)
    - [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)
  - [Simple](#simple)
  - [Advanced](#advanced)
- [Route config compatibility](#route-config-compatibility)
- [Dynamic breadcrumbs](#dynamic-breadcrumbs)
- [Options](#options)
  - [Disabling default generated breadcrumbs](#disabling-default-generated-breadcrumbs)
- [Order matters!](#order-matters)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Description

Render breadcrumbs for `react-router` however you want!

#### Features
- Easy to get started with automatically generated breadcrumbs.
- Render, map, and wrap breadcrumbs any way you want.
- Compatible with existing [route configs](https://reacttraining.com/react-router/web/example/route-config).

## Install

`yarn add react-router-breadcrumbs-hoc`

or

`npm i react-router-breadcrumbs-hoc --save`

## Usage

```js
withBreadcrumbs()(MyComponent);
```

## Examples

### Simple
Start seeing generated breadcrumbs right away with this simple example ([codesandbox](https://codesandbox.io/s/bare-bones-example-kcdrt))
```js
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

const Breadcrumbs = ({ breadcrumbs }) => (
  <>
    {breadcrumbs.map(({ breadcrumb }) => breadcrumb)}
  </>
)

export default withBreadcrumbs()(Breadcrumbs);
```

### Advanced
The example above will work for some routes, but you may want other routes to be dynamic (such as a user name breadcrumb). Let's modify it to handle custom-set breadcrumbs. ([codesandbox](https://codesandbox.io/s/basic-dynamic-example-m03tz))

```js
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

const userNamesById = { '1': 'John' }

const DynamicUserBreadcrumb = ({ match }) => (
  <span>{userNamesById[match.params.userId]}</span>
);

// define custom breadcrumbs for certain routes.
// breadcumbs can be components or strings.
const routes = [
  { path: '/users/:userId', breadcrumb: DynamicUserBreadcrumb },
  { path: '/example', breadcrumb: 'Custom Example' },
];

// map, render, and wrap your breadcrumb components however you want.
const Breadcrumbs = ({ breadcrumbs }) => (
  <div>
    {breadcrumbs.map(({
      match,
      breadcrumb
    }) => (
      <span key={match.url}>
        <NavLink to={match.url}>{breadcrumb}</NavLink>
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
/users/1 | Home / Users / John
/example | Home / Custom Example

## [Route config](https://reacttraining.com/react-router/web/example/route-config) compatibility

Add breadcrumbs to your existing [route config](https://reacttraining.com/react-router/web/example/route-config). This is a great way to keep all routing config paths in a single place! If a path ever changes, you'll only have to change it in your main route config rather than maintaining a _separate_ config for `react-router-breadcrumbs-hoc`.

For example...

```js
const routeConfig = [
  {
    path: "/sandwiches",
    component: Sandwiches
  }
];
```

becomes...

```js
const routeConfig = [
  {
    path: "/sandwiches",
    component: Sandwiches,
    breadcrumb: 'I love sandwiches'
  }
];
```

then you can just pass the whole route config right into the hook:

```js
withBreadcrumbs(routeConfig)(MyComponent);
```

## Dynamic breadcrumbs

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

Now we can pass this custom `redux` breadcrumb into the HOC:

```js
withBreadcrumbs([{
  path: '/users/:id',
  breadcrumb: UserBreadcrumb
}]);
```

----

Similarly, the [location](https://reacttraining.com/react-router/web/api/location) object could be useful for displaying dynamic breadcrumbs based on the route's state:

```jsx
// dynamically update EditorBreadcrumb based on state info
const EditorBreadcrumb = ({ location: { state: { isNew } } }) => (
  <span>{isNew ? 'Add New' : 'Update'}</span>
);

// routes = [{ path: '/editor', breadcrumb: EditorBreadcrumb }]

// upon navigation, breadcrumb will display: Update
<Link to={{ pathname: '/editor' }}>Edit</Link>

// upon navigation, breadcrumb will display: Add New
<Link to={{ pathname: '/editor', state: { isNew: true } }}>Add</Link>
```

## Options

An options object can be passed as the 2nd argument to the hook.

```js
withBreadcrumbs(routes, options)(Component);
```

Option | Type | Description
--- | --- | ---
`disableDefaults` | `Boolean` | Disables all default generated breadcrumbs. |
`excludePaths` | `Array<String>` | Disables default generated breadcrumbs for specific paths. |

### Disabling default generated breadcrumbs

This package will attempt to create breadcrumbs for you based on the route section. For example `/users` will automatically create the breadcrumb `"Users"`. There are two ways to disable default breadcrumbs for a path:

**Option 1:** Disable _all_ default breadcrumb generation by passing `disableDefaults: true` in the `options` object

`withBreadcrumbs(routes, { disableDefaults: true })`

**Option 2:** Disable _individual_ default breadcrumbs by passing `breadcrumb: null` in route config:

`{ path: '/a/b', breadcrumb: null }`

**Option 3:** Disable _individual_ default breadcrumbs by passing an `excludePaths` array in the `options` object

`withBreadcrumbs(routes, { excludePaths: ['/', '/no-breadcrumb/for-this-route'] })`

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

## API

```js
Route = {
  path: String
  breadcrumb?: String|Component // if not provided, a default breadcrumb will be returned
  matchOptions?: {             // see: https://reacttraining.com/react-router/web/api/matchPath
    exact?: Boolean,
    strict?: Boolean,
  }
}

Options = {
  excludePaths?: string[]       // disable default breadcrumb generation for specific paths
  disableDefaults?: Boolean  // disable all default breadcrumb generation
}

// if routes are not passed, default breadcrumbs will be returned
withBreadcrumbs(routes?: Route[], options?: Options): HigherOrderComponent

// you shouldn't ever really have to use `getBreadcrumbs`, but it's
// exported for convenience if you don't want to use the HOC
getBreadcrumbs({
  routes: Route[],
  options: Options,
}): Breadcrumb[]
```
