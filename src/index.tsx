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
import { useLocation, matchPath, withRouter } from 'react-router';

// eslint-disable-next-line import/extensions, import/no-unresolved, no-unused-vars
import * as types from '../types/react-router-breadcrumbs-hoc/index';

const DEFAULT_MATCH_OPTIONS = { exact: true };
const NO_BREADCRUMB = 'NO_BREADCRUMB';

/**
 * This method was "borrowed" from https://stackoverflow.com/a/28339742
 * we used to use the humanize-string package, but it added a lot of bundle
 * size and issues with compilation. This 4-liner seems to cover most cases.
 */
const humanize = (str: string): string => str
  .replace(/^[\s_]+|[\s_]+$/g, '')
  .replace(/[_\s]+/g, ' ')
  .replace(/^[a-z]/, (m) => m.toUpperCase());

/**
 * Renders and returns the breadcrumb complete
 * with `match`, `location`, and `key` props.
 */
const render = ({
  breadcrumb: Breadcrumb,
  match,
  location,
  ...rest
}: {
  breadcrumb: React.ComponentType | string,
  match: { url: string },
  location: types.Location
}): {
  match: { url: string },
  location: types.Location,
  key: string,
  breadcrumb: React.ReactNode
} => {
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
const getDefaultBreadcrumb = ({
  currentSection,
  location,
  pathSection,
}: {
  currentSection: string,
  location: types.Location,
  pathSection: string,
}) => {
  const match = matchPath(pathSection, { ...DEFAULT_MATCH_OPTIONS, path: pathSection })
    /* istanbul ignore next: this is hard to mock in jest :( */
    || { url: 'not-found' };

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
}: {
  currentSection: string,
  disableDefaults?: boolean,
  excludePaths?: string[],
  location: { pathname: string },
  pathSection: string,
  routes: types.BreadcrumbsRoute[]
}) => {
  let breadcrumb;

  // Check the optional `excludePaths` option in `options` to see if the
  // current path should not include a breadcrumb.
  const getIsPathExcluded = (path: string) => matchPath(pathSection, {
    path,
    exact: true,
    strict: false,
  });
  if (excludePaths && excludePaths.some(getIsPathExcluded)) {
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
export const getBreadcrumbs = (
  {
    routes,
    location,
    options = {},
  }: {
    routes: types.BreadcrumbsRoute[],
    location: types.Location,
    options?: types.Options
  },
): Array<React.ReactNode | string> => {
  const matches:Array<React.ReactNode | string> = [];
  const { pathname } = location;

  pathname
    .split('?')[0]
    // Remove trailing slash "/" from pathname.
    .replace(/\/$/, '')
    // Split pathname into sections.
    .split('/')
    // Reduce over the sections and call `getBreadcrumbMatch()` for each section.
    .reduce((previousSection: string, currentSection: string) => {
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
    }, '');

  return matches;
};

/**
 * Takes a route array and recursively flattens it IF there are
 * nested routes in the config.
*/
const flattenRoutes = (routes: types.BreadcrumbsRoute[]) => (routes)
  .reduce((arr, route: types.BreadcrumbsRoute): types.BreadcrumbsRoute[] => {
    if (route.routes) {
      return arr.concat([route, ...flattenRoutes(route.routes)]);
    }
    return arr.concat(route);
  }, [] as types.BreadcrumbsRoute[]);

/**
 * This is the main default HOC wrapper component. There is some
 * logic in here for legacy react-router v4 support
 */
export default (
  routes?: types.BreadcrumbsRoute[],
  options?: types.Options,
) => (
  Component: React.ComponentType<{
    breadcrumbs: Array<React.ReactNode | string>
  }>,
) => {
  const sharedBreadcrumbProps = {
    options,
    routes: flattenRoutes(routes || []),
  };

  // use the location hook if available (5.x)
  /* istanbul ignore else */
  if (useLocation) {
    return (props: any) => React.createElement(Component, {
      ...props,
      breadcrumbs: getBreadcrumbs({
        ...sharedBreadcrumbProps,
        location: useLocation(),
      }),
    });
  }

  // fallback to withRouter for older react-router versions (4.x)
  /* istanbul ignore next */
  return withRouter(
    (props: { location: types.Location }) => {
      // eslint-disable-next-line no-console
      console.warn('[react-router-breadcrumbs-hoc]: react-router v4 support will be deprecated in the next major release. Please consider upgrading react-router and react-router-dom to >= 5.1.0');

      return createElement(Component, {
        ...props,
        breadcrumbs: getBreadcrumbs({
          ...sharedBreadcrumbProps,
          location: props.location,
        }),
      });
    },
  );
};
