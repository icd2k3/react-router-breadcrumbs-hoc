## Migrating from 2.x.x -> 3.x.x

#### First things, first...

`withBreadcrumbs` now returns an array of `Object`s instead of `Component`s:

```diff
-  breadcrumbs.map(breadcrumb)
+  breadcrumbs.map({ breadcrumb })
```

Within this object, other props like `match`, `location`, and pass-through props are also returned:

```diff
-  breadcrumbs.map((breadcrumb) => {})
+  breadcrumbs.map(({ breadcrumb, match, location, someCustomProp }) => {})
```

#### Why was this change made?

Under the hood, `withBreadcrumbs` uses React's `createElement` method to render breadcrumbs. In version 2, all props (like `match`, `location`, etc) were assigned to the rendered component (for example: `createElement(breadcrumb, componentProps);`).

This had the unintended side-effect of rendering any of these props as an _attribute_ on the DOM element. So, ultimately this resulted in some breadcrumbs rendering like `<span someProp="[Object object]"/>'` as well as some React console warnings [in certain cases](https://github.com/icd2k3/react-router-breadcrumbs-hoc/issues/59).

This issue has been solved by adding the following logic:
- If the breadcrumb is a simple string, don't render it with props applied
- If the breadcrumb is a function/class (dynamic), _then_ pass all the props to it
- Return objects instead of components so that we can still utilize all the props during the `map`
