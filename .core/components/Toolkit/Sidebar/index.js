
/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import React, { Component, Fragment } from 'react';
import Toolbar from '../Toolbar';
import Menu from '../Menu';


/**
 * -----------------------------------------------------------------------------
 * React Component: Sidebar
 * -----------------------------------------------------------------------------
 */

export default class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...this.props,
        };
    }

    componentDidMount() {
        if (this.state.hasOwnProperty('mount')) {
            this.state.mount(this);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(prevState => ({
            ...prevState,
            ...nextProps,
        }));
    }

    render() {
        let { closed, menu, onMenuItemClick, onToolbarItemClick, position, toolbar = {} } = this.state;

        let cls = (closed === true) ? 're-toolkit-sidebar-closed' : '';
        return (
            <aside className={`re-toolkit-sidebar ${cls} ${position}`}>
                <Toolbar {...toolbar} onToolbarItemClick={onToolbarItemClick} />
                <Menu data={menu} onItemClick={onMenuItemClick} />
            </aside>
        );
    }
}

Sidebar.defaultProps = {
    toolbar: {},
    menu: {},
    closed: false,
    position: 'left',
    onMenuItemClick: null,
    onToolbarItemClick: null,
};
