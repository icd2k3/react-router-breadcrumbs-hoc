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
import { useLocation, matchPath } from 'react-router';

const DEFAULT_MATCH_OPTIONS = { exact: true };
const NO_BREADCRUMB = 'NO_BREADCRUMB';

export interface Options {
  currentSection?: string;
  disableDefaults?: boolean;
  excludePaths?: string[];
  pathSection?: string;
}

export interface Location {
  pathname: string
}

export interface MatchOptions {
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

export interface BreadcrumbsRoute {
  path: string;
  breadcrumb?: React.ComponentType | React.ElementType | string;
  matchOptions?: MatchOptions;
  routes?: BreadcrumbsRoute[];
  [x: string]: any;
}

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
  location: Location
}): {
  match: { url: string },
  location: Location,
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
  location: Location,
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
  routes: BreadcrumbsRoute[]
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
    routes: BreadcrumbsRoute[],
    location: Location,
    options?: Options
  },
): Array<React.ReactNode | string> => {
  const matches:Array<React.ReactNode | string> = [];
  const { pathname } = location;

  pathname
    .split('?')[0]
    // Split pathname into sections.
    .split('/')
    // Reduce over the sections and call `getBreadcrumbMatch()` for each section.
    .reduce((previousSection: string, currentSection: string, index: number) => {
      // Combine the last route section with the currentSection.
      // For example, `pathname = /1/2/3` results in match checks for
      // `/1`, `/1/2`, `/1/2/3`.
      const pathSection = !currentSection ? '/' : `${previousSection}/${currentSection}`;

      // Ignore trailing slash or double slashes in the URL
      if (pathSection === '/' && index !== 0) {
        return '';
      }

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
const flattenRoutes = (routes: BreadcrumbsRoute[]) => (routes)
  .reduce((arr, route: BreadcrumbsRoute): BreadcrumbsRoute[] => {
    if (route.routes) {
      return arr.concat([route, ...flattenRoutes(route.routes)]);
    }
    return arr.concat(route);
  }, [] as BreadcrumbsRoute[]);

/**
 * Accepts optional routes array and options and returns an array of
 * breadcrumbs.
 *
 * @example
 * import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
 * const Breadcrumbs = ({ breadcrumbs }) => (
 *  <>{breadcrumbs.map(({ breadcrumb }) => breadcrumb)}</>
 * )
 * export default withBreadcrumbs()(Breadcrumbs);
 */
const withBreadcrumbs = (
  routes?: BreadcrumbsRoute[],
  options?: Options,
) => (
  Component: React.ComponentType<{
    breadcrumbs: Array<React.ReactNode | string>
  }>,
) => (props: any) => React.createElement(Component, {
  ...props,
  breadcrumbs: getBreadcrumbs({
    options,
    routes: flattenRoutes(routes || []),
    location: useLocation(),
  }),
});

export default withBreadcrumbs;
