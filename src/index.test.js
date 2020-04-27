// @ts-nocheck
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { MemoryRouter as Router } from 'react-router';
import withBreadcrumbs, { getBreadcrumbs } from './index.tsx';

// imports to test compiled builds
import withBreadcrumbsCompiledES, { getBreadcrumbs as getBreadcrumbsCompiledES } from '../dist/es/index';
import withBreadcrumbsCompiledUMD, { getBreadcrumbs as getBreadcrumbsCompiledUMD } from '../dist/umd/index';
import withBreadcrumbsCompiledCJS, { getBreadcrumbs as getBreadcrumbsCompiledCJS } from '../dist/cjs/index';

const components = {
  Breadcrumbs: ({ breadcrumbs, ...forwardedProps }) => (
    <h1>
      <div className="forwarded-props">
        {forwardedProps && Object.values(forwardedProps).filter((v) => typeof v === 'string').map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      <div className="breadcrumbs-container">
        {breadcrumbs.map(({ breadcrumb, key }, index) => (
          <span key={key}>
            {breadcrumb}
            {(index < breadcrumbs.length - 1) && <i> / </i>}
          </span>
        ))}
      </div>
    </h1>
  ),
  BreadcrumbMatchTest: ({ match }) => <span>{match.params.number}</span>,
  BreadcrumbNavLinkTest: ({ match }) => <a to={match.url}>Link</a>,
  BreadcrumbLocationTest: ({ location: { state: { isLocationTest } } }) => (
    <span>
      {isLocationTest ? 'pass' : 'fail'}
    </span>
  ),
  BreadcrumbExtraPropsTest: ({ foo, bar }) => <span>{foo}{bar}</span>,
  BreadcrumbMemoized: React.memo(() => <span>Memoized</span>),
  // eslint-disable-next-line react/prefer-stateless-function
  BreadcrumbClass: class BreadcrumbClass extends React.PureComponent {
    render() { return (<span>Class</span>); }
  },
};

const getHOC = () => {
  switch (process.env.TEST_BUILD) {
    case 'cjs':
      return withBreadcrumbsCompiledCJS;
    case 'umd':
      return withBreadcrumbsCompiledUMD;
    case 'es':
      return withBreadcrumbsCompiledES;
    default:
      return withBreadcrumbs;
  }
};

const getMethod = () => {
  switch (process.env.TEST_BUILD) {
    case 'cjs':
      return getBreadcrumbsCompiledCJS;
    case 'umd':
      return getBreadcrumbsCompiledUMD;
    case 'es':
      return getBreadcrumbsCompiledES;
    default:
      return getBreadcrumbs;
  }
};

const render = ({
  options,
  pathname,
  routes,
  state,
  props,
}) => {
  const Breadcrumbs = getHOC()(routes, options)(components.Breadcrumbs);
  const wrapper = mount(
    <Router
      initialIndex={0}
      initialEntries={[{ pathname, state }]}
    >
      <Breadcrumbs {...props || {}} />
    </Router>,
  );

  return {
    breadcrumbs: wrapper.find('.breadcrumbs-container').text(),
    forwardedProps: wrapper.find('.forwarded-props').text(),
    wrapper,
  };
};

const matchShape = {
  isExact: PropTypes.bool.isRequired,
  params: PropTypes.shape().isRequired,
  path: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

components.Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.shape({
    breadcrumb: PropTypes.node.isRequired,
    match: PropTypes.shape().isRequired,
    location: PropTypes.shape.isRequired,
  })).isRequired,
};

components.BreadcrumbMatchTest.propTypes = {
  match: PropTypes.shape(matchShape).isRequired,
};

components.BreadcrumbNavLinkTest.propTypes = {
  match: PropTypes.shape(matchShape).isRequired,
};

components.BreadcrumbLocationTest.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      isLocationTest: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

components.BreadcrumbExtraPropsTest.propTypes = {
  foo: PropTypes.string.isRequired,
  bar: PropTypes.string.isRequired,
};

describe('react-router-breadcrumbs-hoc', () => {
  describe('Valid routes', () => {
    it('Should render breadcrumb components as expected', () => {
      const routes = [
        // test home route
        { path: '/', breadcrumb: 'Home' },
        // test breadcrumb passed as string
        { path: '/1', breadcrumb: 'One' },
        // test simple breadcrumb component
        { path: '/1/2', breadcrumb: () => <span>TWO</span> },
        // test advanced breadcrumb component (user can use `match` however they wish)
        { path: '/1/2/:number', breadcrumb: components.BreadcrumbMatchTest },
        // test NavLink wrapped breadcrumb
        { path: '/1/2/:number/4', breadcrumb: components.BreadcrumbNavLinkTest },
        // test a no-match route
        { path: '/no-match', breadcrumb: 'no match' },
      ];
      const { breadcrumbs, wrapper } = render({ pathname: '/1/2/3/4', routes });
      expect(breadcrumbs).toBe('Home / One / TWO / 3 / Link');
      expect(wrapper.find('a').props().to).toBe('/1/2/3/4');
    });
  });

  describe('Route order', () => {
    it('Should match the first breadcrumb in route array user/create', () => {
      const routes = [
        {
          path: '/user/create',
          breadcrumb: 'Add User',
        },
        {
          path: '/user/:id',
          breadcrumb: '1',
        },
      ];
      const { breadcrumbs } = render({ pathname: '/user/create', routes });
      expect(breadcrumbs).toBe('Home / User / Add User');
    });

    it('Should match the first breadcrumb in route array user/:id', () => {
      const routes = [
        {
          path: '/user/:id',
          breadcrumb: 'Oops',
        },
        {
          path: '/user/create',
          breadcrumb: 'Add User',
        },
      ];
      const { breadcrumbs } = render({ pathname: '/user/create', routes });
      expect(breadcrumbs).toBe('Home / User / Oops');
    });
  });

  describe('Different component types', () => {
    it('Should render memoized components', () => {
      const routes = [{ path: '/memo', breadcrumb: components.BreadcrumbMemoized }];
      const { breadcrumbs } = render({ pathname: '/memo', routes });
      expect(breadcrumbs).toBe('Home / Memoized');
    });

    it('Should render class components', () => {
      const routes = [{ path: '/class', breadcrumb: components.BreadcrumbClass }];
      const { breadcrumbs } = render({ pathname: '/class', routes });
      expect(breadcrumbs).toBe('Home / Class');
    });
  });

  describe('When extending react-router config', () => {
    it('Should render expected breadcrumbs with sensible defaults', () => {
      const routes = [
        { path: '/one', breadcrumb: 'OneCustom' },
        { path: '/one/two' },
      ];
      const { breadcrumbs } = render({ pathname: '/one/two', routes });
      expect(breadcrumbs).toBe('Home / OneCustom / Two');
    });

    it('Should support nested routes', () => {
      const routes = [
        {
          path: '/one',
          routes: [
            {
              path: '/one/two',
              breadcrumb: 'TwoCustom',
              routes: [
                { path: '/one/two/three', breadcrumb: 'ThreeCustom' },
              ],
            },
          ],
        },
      ];
      const { breadcrumbs } = render({ pathname: '/one/two/three', routes });
      expect(breadcrumbs).toBe('Home / One / TwoCustom / ThreeCustom');
    });
  });

  describe('Defaults', () => {
    describe('No routes array', () => {
      it('Should automatically render breadcrumbs with default strings', () => {
        const { breadcrumbs } = render({ pathname: '/one/two' });

        expect(breadcrumbs).toBe('Home / One / Two');
      });
    });

    describe('Override defaults', () => {
      it('Should render user-provided breadcrumbs where possible and use defaults otherwise', () => {
        const routes = [{ path: '/one', breadcrumb: 'Override' }];
        const { breadcrumbs } = render({ pathname: '/one/two', routes });

        expect(breadcrumbs).toBe('Home / Override / Two');
      });
    });

    describe('No breadcrumb', () => {
      it('Should be possible to NOT render a breadcrumb', () => {
        const routes = [{ path: '/one', breadcrumb: null }];
        const { breadcrumbs } = render({ pathname: '/one/two', routes });

        expect(breadcrumbs).toBe('Home / Two');
      });

      it('Should be possible to NOT render a "Home" breadcrumb', () => {
        const routes = [{ path: '/', breadcrumb: null }];
        const { breadcrumbs } = render({ pathname: '/one/two', routes });

        expect(breadcrumbs).toBe('One / Two');
      });
    });
  });

  describe('When using the location object', () => {
    it('Should be provided in the rendered breadcrumb component', () => {
      const routes = [{ path: '/one', breadcrumb: components.BreadcrumbLocationTest }];
      const { breadcrumbs } = render({ pathname: '/one', state: { isLocationTest: true }, routes });
      expect(breadcrumbs).toBe('Home / pass');
    });
  });

  describe('When pathname includes query params', () => {
    it('Should not render query breadcrumb', () => {
      const { breadcrumbs } = render({ pathname: '/one?mock=query' });
      expect(breadcrumbs).toBe('Home / One');
    });
  });

  describe('When pathname includes a trailing slash', () => {
    it('Should ignore the trailing slash', () => {
      const { breadcrumbs } = render({ pathname: '/one/' });
      expect(breadcrumbs).toBe('Home / One');
    });
  });

  describe('When using additional props inside routes', () => {
    it('Should pass through extra props to user-provided components', () => {
      const routes = [
        {
          path: '/one',
          breadcrumb: components.BreadcrumbExtraPropsTest,
          foo: 'Pass through',
          bar: ' props',
        },
      ];
      const { breadcrumbs } = render({ pathname: '/one', routes });
      expect(breadcrumbs).toBe('Home / Pass through props');
    });
  });

  describe('Options', () => {
    describe('excludePaths', () => {
      it('Should not return breadcrumbs for specified paths', () => {
        const { breadcrumbs } = render({ pathname: '/one/two', options: { excludePaths: ['/', '/one'] } });
        expect(breadcrumbs).toBe('Two');
      });

      it('Should work with url params', () => {
        const routes = [
          { path: '/a' },
          { path: '/a/:b' },
          { path: '/a/:b/:c' },
        ];
        const { breadcrumbs } = render({
          pathname: '/a/b/c',
          routes,
          options: { excludePaths: ['/a/:b', '/a'] },
        });
        expect(breadcrumbs).toBe('Home / C');
      });
    });

    describe('options without routes array', () => {
      it('Should be able to set options without defining a routes array', () => {
        const { breadcrumbs } = render({ pathname: '/one/two', routes: null, options: { excludePaths: ['/', '/one'] } });
        expect(breadcrumbs).toBe('Two');
      });
    });

    describe('disableDefaults', () => {
      it('Should disable all default breadcrumb generation', () => {
        const routes = [{ path: '/one', breadcrumb: 'One' }, { path: '/one/two' }];
        const { breadcrumbs } = render({ pathname: '/one/two', routes, options: { disableDefaults: true } });

        expect(breadcrumbs).toBe('One');
      });
    });
  });

  describe('Invalid route object', () => {
    it('Should error if `path` is not provided', () => {
      expect(() => getMethod()({ routes: [{ breadcrumb: 'Yo' }], location: { pathname: '/1' } }))
        .toThrow('withBreadcrumbs: `path` must be provided in every route object');
    });
  });

  describe('DOM rendering', () => {
    it('Should not render props as element attributes on breadcrumbs', () => {
      const { wrapper } = render({ pathname: '/one' });
      expect(wrapper.html()).not.toContain('[object Object]');
    });
  });

  describe('HOC prop forwarding', () => {
    it('Should allow for forwarding props to the wrapped component', () => {
      const props = { testing: 'prop forwarding works' };
      const { forwardedProps } = render({ pathname: '/', props });
      expect(forwardedProps).toEqual('prop forwarding works');
    });
  });

  describe('Edge cases', () => {
    it('Should handle 2 slashes in a URL (site.com/sandwiches//tuna)', () => {
      const { breadcrumbs } = render({ pathname: '/sandwiches//tuna' });
      expect(breadcrumbs).toBe('Home / Sandwiches / Tuna');
    });
  });
});
