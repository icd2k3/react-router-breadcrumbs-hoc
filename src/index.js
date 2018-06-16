import { createElement } from 'react';
import { matchPath, withRouter } from 'react-router';
import humanizeString from 'humanize-string';

const DEFAULT_MATCH_OPTIONS = { exact: true };
const NO_BREADCRUMB = 'NO_BREADCRUMB';

// renders and returns the breadcrumb complete with `match`, `location`, and `key` props
const render = ({ breadcrumb, match, location }) => {
  const componentProps = { match, location, key: match.url };
  if (typeof breadcrumb === 'function') {
    return createElement(breadcrumb, componentProps);
  }
  return createElement('span', componentProps, breadcrumb);
};

// small helper method to get a default `humanize-string` breadcrumb if the
// user hasn't provided one
const getDefaultBreadcrumb = ({ pathSection, currentSection, location }) => {
  const match = matchPath(pathSection, { ...DEFAULT_MATCH_OPTIONS, path: pathSection });

  return render({
    breadcrumb: humanizeString(currentSection),
    match,
    location,
  });
};

// loops through the route array (if provided) and returns either
// a user-provided breadcrumb OR a sensible default via `humanize-string`
const getBreadcrumb = ({
  currentSection,
  disableDefaults,
  excludePaths,
  location,
  pathSection,
  routes,
}) => {
  let breadcrumb;

  // check the optional `exludePaths` option in `options` to see if the
  // current path should not include a breadcrumb
  if (excludePaths && excludePaths.includes(pathSection)) {
    return NO_BREADCRUMB;
  }

  // loop through the route array and see if the user has provided a custom breadcrumb
  routes.some(({ breadcrumb: userProvidedBreadcrumb, matchOptions, path }) => {
    if (!path) {
      throw new Error('withBreadcrumbs: `path` must be provided in every route object');
    }

    const match = matchPath(pathSection, { ...(matchOptions || DEFAULT_MATCH_OPTIONS), path });

    // if user passed breadcrumb: null OR custom match options to suppress a breadcrumb
    // we need to know NOT to add it to the matches array
    // see: `if (breadcrumb !== NO_BREADCRUMB)` below
    if ((match && userProvidedBreadcrumb === null) || (!match && matchOptions)) {
      breadcrumb = NO_BREADCRUMB;
      return true;
    }

    if (match) {
      // this covers the case where a user may be extending their react-router route
      // config with breadcrumbs, but also does not want default breadcrumbs to be
      // automatically generated (opt-in)
      if (!userProvidedBreadcrumb && disableDefaults) {
        breadcrumb = NO_BREADCRUMB;
        return true;
      }

      breadcrumb = render({
        // although we have a match, the user may be passing their react-router config object
        // which we support. The route config object may not have a `breadcrumb` param specified.
        // If this is the case, we should provide a default via `humanizeString`
        breadcrumb: userProvidedBreadcrumb || humanizeString(currentSection),
        match,
        location,
      });
      return true;
    }
    return false;
  });

  if (breadcrumb) {
    // user provided a breadcrumb prop, or we generated one via humanizeString above ~L75
    return breadcrumb;
  } else if (disableDefaults) {
    // if there was no breadcrumb provided and user has disableDefaults turned on
    return NO_BREADCRUMB;
  }

  // if the above conditionals don't fire, generate a default breadcrumb based on the path
  return getDefaultBreadcrumb({
    pathSection,
    // include a "Home" breadcrumb by default (can be overrode or disabled in config)
    currentSection: pathSection === '/' ? 'Home' : currentSection,
    location,
  });
};

export const getBreadcrumbs = ({ routes, location, options = {} }) => {
  const matches = [];
  const { pathname } = location;

  pathname
    .split('?')[0]
    // remove trailing slash "/" from pathname
    .replace(/\/$/, '')
    // split pathname into sections
    .split('/')
    // reduce over the sections and find matches from `routes` prop
    .reduce((previousSection, currentSection) => {
      // combine the last route section with the currentSection
      // ex `pathname = /1/2/3 results in match checks for
      // `/1`, `/1/2`, `/1/2/3`
      const pathSection = !currentSection ? '/' : `${previousSection}/${currentSection}`;

      const breadcrumb = getBreadcrumb({
        currentSection,
        location,
        pathSection,
        routes,
        ...options,
      });

      // add the breadcrumb to the matches array
      // unless the user has explicitly passed { path: x, breadcrumb: null } to disable
      if (breadcrumb !== NO_BREADCRUMB) {
        matches.push(breadcrumb);
      }

      return pathSection === '/' ? '' : pathSection;
    }, null);

  return matches;
};

// takes a route array and recursively flattens it IF there are
// nested routes in the config
const flattenRoutes = routes => routes.reduce((arr, route) => {
  if (route.routes) {
    return arr.concat([route, ...flattenRoutes(route.routes)]);
  }
  return arr.concat(route);
}, []);

const withBreadcrumbs = (routes = [], options) => Component => withRouter(props =>
  createElement(Component, {
    ...props,
    breadcrumbs: getBreadcrumbs({
      routes: flattenRoutes(routes),
      location: props.location,
      options,
    }),
  }));

export default withBreadcrumbs;
