/**
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This script exports a HOC that accepts a routes array of objects
 * and an options object.
 *
 * API:
 *
 * withBreadcrumbs(
 *   routes?: Array<Route>,
 *   options? Object<Options>,
 * ): HigherOrderComponent
 *
 * More Info:
 *
 * https://github.com/icd2k3/react-router-breadcrumbs-hoc
 *
 */

import React, { createElement } from 'react';
import { matchPath, withRouter } from 'react-router';

const DEFAULT_MATCH_OPTIONS = { exact: true };
const NO_BREADCRUMB = 'NO_BREADCRUMB';

/**
 * This method was "borrowed" from https://stackoverflow.com/a/28339742
 * we used to use the humanize-string package, but it added a lot of bundle
 * size and issues with compilation. This 4-liner seems to cover most cases.
 */
const humanize = str => str
  .replace(/^[\s_]+|[\s_]+$/g, '')
  .replace(/[_\s]+/g, ' ')
  .replace(/^[a-z]/, m => m.toUpperCase());

/**
 * Renders and returns the breadcrumb complete
 * with `match`, `location`, and `key` props.
 */
const render = ({
  component: reactRouterConfigComponent,
  breadcrumb: Breadcrumb,
  match,
  location,
  ...rest
}) => {
  const componentProps = { match, location, key: match.url, ...rest };

  return {
    ...componentProps,
    breadcrumb: typeof Breadcrumb === 'string'
      ? createElement('span', { key: componentProps.key }, Breadcrumb)
      : <Breadcrumb {...componentProps} />,
  };
};

/**
 * Small helper method to get a default breadcrumb if the user hasn't provided one.
*/
const getDefaultBreadcrumb = ({ pathSection, currentSection, location }) => {
  const match = matchPath(pathSection, { ...DEFAULT_MATCH_OPTIONS, path: pathSection });

  return render({
    breadcrumb: humanize(currentSection),
    match,
    location,
  });
};

/**
 * Loops through the route array (if provided) and returns either a
 * user-provided breadcrumb OR a sensible default (if enabled)
*/
const getBreadcrumbMatch = ({
  currentSection,
  disableDefaults,
  excludePaths,
  location,
  pathSection,
  routes,
}) => {
  let breadcrumb;

  // Check the optional `exludePaths` option in `options` to see if the
  // current path should not include a breadcrumb.
  if (excludePaths && excludePaths.includes(pathSection)) {
    return NO_BREADCRUMB;
  }

  // Loop through the route array and see if the user has provided a custom breadcrumb.
  routes.some(({ breadcrumb: userProvidedBreadcrumb, matchOptions, path, ...rest }) => {
    if (!path) {
      throw new Error('withBreadcrumbs: `path` must be provided in every route object');
    }

    const match = matchPath(pathSection, { ...(matchOptions || DEFAULT_MATCH_OPTIONS), path });

    // If user passed breadcrumb: null OR custom match options to suppress a breadcrumb
    // we need to know NOT to add it to the matches array
    // see: `if (breadcrumb !== NO_BREADCRUMB)` below.
    if ((match && userProvidedBreadcrumb === null) || (!match && matchOptions)) {
      breadcrumb = NO_BREADCRUMB;
      return true;
    }

    if (match) {
      // This covers the case where a user may be extending their react-router route
      // config with breadcrumbs, but also does not want default breadcrumbs to be
      // automatically generated (opt-in).
      if (!userProvidedBreadcrumb && disableDefaults) {
        breadcrumb = NO_BREADCRUMB;
        return true;
      }

      breadcrumb = render({
        // Although we have a match, the user may be passing their react-router config object
        // which we support. The route config object may not have a `breadcrumb` param specified.
        // If this is the case, we should provide a default via `humanize`.
        breadcrumb: userProvidedBreadcrumb || humanize(currentSection),
        match,
        location,
        ...rest,
      });
      return true;
    }
    return false;
  });

  // User provided a breadcrumb prop, or we generated one above.
  if (breadcrumb) {
    return breadcrumb;
  }

  // If there was no breadcrumb provided and user has disableDefaults turned on.
  if (disableDefaults) {
    return NO_BREADCRUMB;
  }

  // If the above conditionals don't fire, generate a default breadcrumb based on the path.
  return getDefaultBreadcrumb({
    pathSection,
    // include a "Home" breadcrumb by default (can be overrode or disabled in config).
    currentSection: pathSection === '/' ? 'Home' : currentSection,
    location,
  });
};

/**
 * Splits the pathname into sections, then search for matches in the routes
 * a user-provided breadcrumb OR a sensible default.
*/
export const getBreadcrumbs = ({ routes, location, options = {} }) => {
  const matches = [];
  const { pathname } = location;

  pathname
    .split('?')[0]
    // Remove trailing slash "/" from pathname.
    .replace(/\/$/, '')
    // Split pathname into sections.
    .split('/')
    // Reduce over the sections and call `getBreadcrumbMatch()` for each section.
    .reduce((previousSection, currentSection) => {
      // Combine the last route section with the currentSection.
      // For example, `pathname = /1/2/3` results in match checks for
      // `/1`, `/1/2`, `/1/2/3`.
      const pathSection = !currentSection ? '/' : `${previousSection}/${currentSection}`;

      const breadcrumb = getBreadcrumbMatch({
        currentSection,
        location,
        pathSection,
        routes,
        ...options,
      });

      // Add the breadcrumb to the matches array
      // unless the user has explicitly passed.
      // { path: x, breadcrumb: null } to disable.
      if (breadcrumb !== NO_BREADCRUMB) {
        matches.push(breadcrumb);
      }

      return pathSection === '/' ? '' : pathSection;
    }, null);

  return matches;
};

/**
 * Takes a route array and recursively flattens it IF there are
 * nested routes in the config.
*/
const flattenRoutes = routes => routes.reduce((arr, route) => {
  if (route.routes) {
    return arr.concat([route, ...flattenRoutes(route.routes)]);
  }
  return arr.concat(route);
}, []);

export default (routes = [], options) => Component => withRouter(props => createElement(Component, {
  ...props,
  breadcrumbs: getBreadcrumbs({
    routes: flattenRoutes(routes),
    location: props.location,
    options,
  }),
}));
