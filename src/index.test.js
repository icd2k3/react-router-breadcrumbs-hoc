/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { MemoryRouter as Router } from 'react-router';
import { NavLink } from 'react-router-dom';
import withBreadcrumbs, { getBreadcrumbs } from './index';

const components = {
  Breadcrumbs: ({ breadcrumbs }) => (
    <h1 className="breadcrumbs-container">
      {breadcrumbs.map((breadcrumb, index) => (
        <span key={breadcrumb.key}>
          {breadcrumb}
          {(index < breadcrumbs.length - 1) && <i> / </i>}
        </span>
      ))}
    </h1>
  ),
  BreadcrumbMatchTest: ({ match }) => <span>{match.params.number}</span>,
  BreadcrumbNavLinkTest: ({ match }) => <NavLink to={match.url}>Link</NavLink>,
  BreadcrumbLocationTest: ({ location: { state: { isLocationTest } } }) => (
    <span>
      {isLocationTest ? 'pass' : 'fail'}
    </span>
  ),
};

const render = ({
  options,
  pathname,
  routes,
  state,
}) => {
  const Breadcrumbs = withBreadcrumbs(routes, options)(components.Breadcrumbs);
  const wrapper =
    mount(<Router initialIndex={0} initialEntries={[{ pathname, state }]}><Breadcrumbs /></Router>);

  return {
    breadcrumbs: wrapper.find('.breadcrumbs-container').text(),
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
  breadcrumbs: PropTypes.arrayOf(PropTypes.node).isRequired,
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
      expect(wrapper.find(NavLink).props().to).toBe('/1/2/3/4');
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

  describe('Custom match options', () => {
    it('Should allow `strict` rule', () => {
      const routes = [
        {
          path: '/one/',
          breadcrumb: '1',
          // not recommended, but supported
          matchOptions: { exact: false, strict: true },
        },
      ];
      const { breadcrumbs } = render({ pathname: '/one', routes });
      expect(breadcrumbs).toBe('');
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

  describe('Options', () => {
    describe('excludePaths', () => {
      it('Should not return breadcrumbs for specified paths', () => {
        const { breadcrumbs } = render({ pathname: '/one/two', options: { excludePaths: ['/', '/one'] } });
        expect(breadcrumbs).toBe('Two');
      });
    });
  });

  describe('Invalid route object', () => {
    it('Should error if `path` is not provided', () => {
      expect(() => getBreadcrumbs({ routes: [{ breadcrumb: 'Yo' }], location: { pathname: '/1' } }))
        .toThrow('withBreadcrumbs: `path` must be provided in every route object');
    });
  });
});
