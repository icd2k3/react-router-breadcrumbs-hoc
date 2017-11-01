<h3 align="center">
  React Router Breadcrumbs HOC
</h3>

<p align="center">
  A small, flexible HOC for rendering breadcrumbs
</p>

<p align="center">
  `http://site.com/user/id` -> `user / John Doe`
</p>

## Install

`yarn add react-router-breadcrumbs-hoc` or `npm install react-router-breadcrumbs-hoc`

## Usage

`Breadcrumbs.jsx`
```js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { withBreadcumbs } from 'react-router-breadcrumbs-hoc';

const PureUserBreadcrumb = ({ firstName }) => <span>{firstName}</span>;
const UserBreadcrumb = fetchUser(PureUserBreadcrumb);

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

export default withBreadcrumbs([
  { path: users, breadcrumb: 'Users' },
  { path: users/:userId, breadcrumb: UserBreadcrumb},
  { path: something-else, breadcrumb: ':)' },
])(MuhBreadcrumbs);
```

## API
