import React from 'react';
// import { assert } from 'chai';
import { shallow, mount } from 'enzyme';
import { StaticRouter as Router } from 'react-router';
import { withBreadcrumbs } from './index';

describe('react-router-breadcrumbs-hoc', () => {
  describe('withBreadcrumbs', () => {
    const routes = [
      // test breadcrumb passed as string
      { path: '/1', breadcrumb: '1' },
      // test simple breadcrumb component
      { path: '/1/2', breadcrumb: () => <span>TWO</span> },
      // test advanced breadcrumb component (user can use `match` however they wish)
      { path: '/1/2/:number', breadcrumb: ({ match }) => <span>{match.params.number}</span> },
      // test a no-match route
      { path: '/no-match', breadcrumb: 'no match' },
    ];
    const routerProps = {
      context: {},
      location: { pathname: '/1/2/3' },
    };
    const Component = ({ breadcrumbs }) => (
      <div className="breadcrumbs-container">
        {breadcrumbs.map(({ breadcrumb, path }) => <span key={path}>{breadcrumb}</span>)}
      </div>
    );

    it('Should render strings & functions into breadcrumb NavLink components', () => {
      const C = withBreadcrumbs(routes)(Component);
      const wrapper = mount(<Router {...routerProps}><C /></Router>);

      expect(wrapper.find(C)).toMatchSnapshot();
    });

    it('Should accept navLinkProps to apply to the <NavLink> component', () => {
      const navLinkProps = { className: 'mock-navlink-class', activeClassName: 'mock-active-navlink-class' };
      const C = withBreadcrumbs(routes, navLinkProps)(Component);
      const wrapper = mount(<Router {...routerProps}><C /></Router>);

      expect(wrapper.find(C)).toMatchSnapshot();
    });

    it('Should NOT wrap breadcrumbs in <NavLink> components if passed `false` for navLinkProps', () => {
      const C = withBreadcrumbs(routes, false)(Component);
      const wrapper = mount(<Router {...routerProps}><C /></Router>);

      expect(wrapper.find(C)).toMatchSnapshot();
    });
  });
});
