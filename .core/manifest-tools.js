const tree = require('directory-tree');
const path = require('path');
const fs = require('fs');
const _ = require('underscore');

const manifestFilePath = path.resolve('./src/', 'manifest.js');

const flattenRegistry = (registry = { children: [] }, manifest = []) =>
    registry.children.reduce((manifest, item) => {
        if ('children' in item) {
            return flattenRegistry(item, manifest);
        }
        if ('path' in item) {
            manifest.push(item);
        }
        return manifest;
    }, manifest);

const jsSources = sourcePath =>
    flattenRegistry(
        tree(sourcePath, {
            extensions: /\.js$/,
            exclude: /.ds_store/i
        })
    );

const find = (searches = [], sourcePaths) => {
    let mappings = searches.reduce((mappings, { name, type }) => {
        mappings[name] = {
            type,
            imports: []
        };
        return mappings;
    }, {});

    sourcePaths.forEach(sourcePath => {
        mappings = jsSources(sourcePath.from)
            .map(file => file.path)
            .reduce((mappings, file) => {
                searches.forEach(({ name, pattern }) => {
                    if (pattern.test(file)) {
                        mappings[name].imports.push(
                            file
                                .replace(/\\/g, '/')
                                .replace(sourcePath.from, sourcePath.to)
                                .replace(/.js$/, '')
                        );
                    }
                });

                return mappings;
            }, mappings);
    });

    return mappings;
};

module.exports = function() {
    const manifest = find(
        [
            {
                name: 'allActions',
                type: 'actions',
                pattern: /actions.js$/
            },
            {
                name: 'allActionTypes',
                type: 'actionTypes',
                pattern: /actionTypes.js$/
            },
            {
                name: 'allReducers',
                type: 'reducers',
                pattern: /reducers.js$/
            },
            {
                name: 'allInitialStates',
                type: 'state',
                pattern: /state.js$/
            },
            {
                name: 'allRoutes',
                type: 'route',
                pattern: /route.js$/
            },
            {
                name: 'allServices',
                type: 'services',
                pattern: /services.js$/
            }
        ],
        [
            {
                from: 'src/app/',
                to: ''
            },
            {
                from: '.core/',
                to: 'reactium-core/'
            }
        ]
    );

    let manifestFileExists = false;
    try {
        manifestFileExists = fs.readFileSync(
            path.resolve('./src/', 'manifest.js')
        );
    } catch (err) {
        // swallow
    }

    const manifestDiffers = (current, next) => {
        let differs = false;
        Object.keys(current).map(type => {
            differs =
                differs ||
                _.difference(
                    current[type].imports.sort(),
                    next[type].imports.sort()
                ).length > 0;

            differs =
                differs ||
                _.difference(
                    next[type].imports.sort(),
                    current[type].imports.sort()
                ).length > 0;
        });

        return differs;
    };

    let shouldWriteManifest = true;
    if (manifestFileExists) {
        const existing = require(manifestFilePath).list();
        shouldWriteManifest = manifestDiffers(existing, manifest);
    }

    // Write Manifest only if it does not exist or has changed
    if (shouldWriteManifest) {
        console.log('=========== Writing new manifest.js ===========');
        const fileContents = `
/** generated by createManifest.js **/
module.exports = {
    get: () => {
        return {\n${Object.keys(manifest)
            .map(key => {
                const { imports, type } = manifest[key];
                return (
                    `          ${key}: {\n` +
                    imports
                        .map(file => {
                            const found = file
                                .replace(/\\/g, '/')
                                .match(
                                    new RegExp(`\/([A-Za-z_0-9]+?)\/${type}$`)
                                );
                            let [, domain] = found;
                            return `            ${domain}: require('${file}').default,\n`;
                        })
                        .join('') +
                    '          },\n'
                );
            })
            .join('')}
        }
    },
    list: () => {
        return ${JSON.stringify(manifest, null, 2)};
    }
}
`;
        fs.writeFileSync(manifestFilePath, fileContents);
    }
};