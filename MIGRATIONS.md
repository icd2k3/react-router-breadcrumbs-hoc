## Migrating from 1.x.x -> 2.x.x

#### 1.) `withBreadcrumbs` is now the default export

_1.x.x_
```js
import { withBreadcrumbs } from 'react-router-breadcrumbs-hoc';
```

_2.x.x_
```js
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
```

#### 2.) The breadcrumbs array returned by the HOC is now _just_ the components. It _used_ to be an array of objects, but I decided this approach was easier to understand and made the implementation code a bit cleaner.

_1.x.x_
```js
{breadcrumbs.map(({ breadcrumb, path, match }) => (
  <span key={path}>
    <NavLink to={match.url}>
      {breadcrumb}
    </NavLink>
  </span>
))}
```

_2.x.x_
```js
{breadcrumbs.map(breadcrumb => (
  <span key={breadcrumb.props.key}>
    <NavLink to={breadcrumb.props.match.url}>
      {breadcrumb}
    </NavLink>
  </span>
))}
```

#### 3.) The package will now attempt to return sensible defaults for breadcrumbs unless otherwise provided making the the package now "opt-out" instead of "opt-in" for all paths. See the readme for how to disable default breadcrumb behavior.

_1.x.x_
```js
withBreadcrumbs([
  { path: '/', breadcrumb: 'Home' },
  { path: '/users', breadcrumb: 'Users' },
])(Component);
```

_2.x.x_ (the above breadcrumbs will be automagically generated so there's no need to include them in config)
```js
withBreadcrumbs()(Component);
```
