import deps from 'dependencies';

export default {
    addPlugin: ({ id, component, zone, order = 0, ...pluginProps }) => ({
        type: deps().actionTypes.ADD_PLUGIN,
        id,
        component,
        zone,
        order,
        ...pluginProps,
    }),

    updatePlugin: ({ id, ...pluginProps }) => ({
        type: deps().actionTypes.UPDATE_PLUGIN,
        id,
        ...pluginProps,
    }),

    removePlugin: id => ({
        type: deps().actionTypes.REMOVE_PLUGIN,
        id,
    }),

    addControls: ({ name, controls }) => ({
        type: deps().actionTypes.ADD_PLUGIN_CONTROLS,
        name,
        controls,
    }),

    removeControls: name => ({
        type: deps().actionTypes.REMOVE_PLUGIN_CONTROLS,
        name,
    }),
};
