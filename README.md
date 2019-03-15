<h3 align="center">
  React Router Breadcrumbs HOC
</h3>

<p align="center">
  A small (~3kb gzip), flexible, <a href="https://reactjs.org/docs/higher-order-components.html">higher order component</a> for rendering breadcrumbs with <a href="https://github.com/ReactTraining/react-router">react-router</a> 4.x
</p>

<p align="center">
  site.com/user/id → Home / User / John Doe
</p>

<p align="center">
  <a href="https://travis-ci.org/icd2k3/react-router-breadcrumbs-hoc" target="_blank"><img src="https://travis-ci.org/icd2k3/react-router-breadcrumbs-hoc.svg?branch=master" /></a>
  <a href="https://coveralls.io/github/icd2k3/react-router-breadcrumbs-hoc?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/icd2k3/react-router-breadcrumbs-hoc/badge.svg?branch=master" /></a>
  <a href="https://codeclimate.com/github/icd2k3/react-router-breadcrumbs-hoc/maintainability"><img src="https://api.codeclimate.com/v1/badges/9f4bd022e2a21f40fc3a/maintainability" /></a>
</p>

## Description

Deconstruct a route and return matching breadcrumb components you can render however you like. Render a simple string, a component that fetches a model in order to display the desired content, or just render something totally unrelated to the route.

## Install

`yarn add react-router-breadcrumbs-hoc`

or

`npm install react-router-breadcrumbs-hoc --save`

## Usage

```js
withBreadcrumbs()(MyComponent);
```

## Examples

Start seeing generated breadcrumbs right away with this simple example
```js
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

const Breadcrumbs = ({ breadcrumbs }) => (
  <React.Fragment>
    {breadcrumbs.map(({ breadcrumb }) => breadcrumb)}
  </React.Fragment>
)

export default withBreadcrumbs()(Breadcrumbs);
```

The example above will work for some routes, but you may want other routes to be dynamic (such as a user name breadcrumb). Let's modify it to handle custom-set breadcrumbs.

```js
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

const userNamesById = { '1': 'John' }

const DynamicUserBreadcrumb = ({ match }) => (
  <span>{userNamesById[match.params.userId]}</span>
);

const routes = [
  { path: '/users/:userId', breadcrumb: DynamicUserBreadcrumb },
  { path: '/example', breadcrumb: 'Custom Example' },
];

// map & render your breadcrumb components however you want.
const Breadcrumbs = ({ breadcrumbs }) => (
  <div>
    {breadcrumbs.map(({
      match,
      breadcrumb
      // other props are available during render, such as `location` 
      // and any props found in your route objects will be passed through too
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

## Already using a [route config](https://reacttraining.com/react-router/web/example/route-config) array with react-router?

Just add a `breadcrumb` prop to your routes that require custom breadcrumbs.

`{ path, component }` -> `{ path, component, breadcrumb }`

`withBreadcrumbs(routeConfig)(MyComponent)`

## Disabling default generated breadcrumbs

This package will attempt to create breadcrumbs for you based on the route section. For example `/users` will auotmatically create the breadcrumb `"Users"`. There are two ways to disable default breadcrumbs for a path:

**Option 1:** Disable _all_ default breadcrumb generation by passing `disableDefaults: true` in the `options` object

`withBreadcrumbs(routes, { disableDefaults: true })`

**Option 2:** Disable _individual_ default breadcrumbs by passing `breadcrumb: null` in route config:

`{ path: '/a/b', breadcrumb: null }`

**Option 3:** Disable _individual_ default breadcrumbs by passing an `excludePaths` array in the `options` object

`withBreadcrumbs(routes, { excludePaths: ['/', '/no-breadcrumb/for-this-route'] })`


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
  breadcrumb: String|Function? // if not provided, a default breadcrumb will be returned
  matchOptions?: {             // see: https://reacttraining.com/react-router/web/api/matchPath
    exact?: Boolean,
    strict?: Boolean,
  }
}

Options = {
  excludePaths: Array       // disable default breadcrumb generation for specific paths
  disableDefaults: Boolean  // disable all default breadcrumb generation
}

// if routes are not passed, default breadcrumbs will be returned
withBreadcrumbs(routes?: Array<Route>, options? Object<Options>): HigherOrderComponent

// you shouldn't ever really have to use `getBreadcrumbs`, but it's
// exported for convenience if you don't want to use the HOC
getBreadcrumbs({
  routes: Array<Route>,
  options: Object<Options>,
}): Array<Breadcrumb>
```
