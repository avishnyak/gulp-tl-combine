const PLUGIN_NAME = 'gulp-tl-combine',
    through = require('through'),
    path = require('path'),
    gutil = require('gulp-util'),
    _ = require('lodash'),
    PluginError = _.curry(gutil.PluginError)(PLUGIN_NAME),
    File = gutil.File;

function fileParser(file) {
    const fileExtname = path.extname(file.relative);

    if (fileExtname === '.n1ql') {
        let r = {};

        r[`$${path.basename(file.relative, path.extname(file.relative))}`] = file.contents.toString();

        return r;
    } else {
        // Assume this is a JSON file
        return JSON.parse(file.contents.toString());
    }
}

function dataConverter(data) {
    const output = {
        entities: [],
        patches: [],
        views: [],
        queries: [],
        indexes: []
    };

    Object.keys(data).forEach((key)=> {
        const entry = {
            file: key,
            content: data[key]
        };

        if (key.indexOf(`views${path.sep}`) > -1) {
            output.views.push(entry);
        } else if (key.indexOf(`entity-patches${path.sep}`) > -1) {
            output.patches.push(entry);
        } else if (key.indexOf(`entities${path.sep}`) > -1) {
            output.entities.push(entry);
        } else if (key.indexOf(`queries${path.sep}`) > -1) {
            output.queries.push(entry);
        } else if (key.indexOf(`indexes${path.sep}`) > -1) {
            output.indexes.push(entry);
        } else {
            gutil.log(`${key} is not a recognized data type. Skipping.`);
        }
    });

    return new Buffer(JSON.stringify(output, null, 4));
}

module.exports = (fileName, options)=> {
    const defaults = {
        dataConverter,
        pathConverter: (file)=> {
            return path.dirname(file.relative) + path.sep + path.basename(file.relative, path.extname(file.relative));
        },
        fileParser
    };

    var config,
        data = {},
        firstFile = null,
        skipConversion = false; // We keep track of when we should skip the conversion for error cases

    if (!fileName) {
        throw new PluginError('Missing fileName option.');
    }

    config = _.defaults({}, options, defaults);

    function bufferContents(file) {
        if (!firstFile) {
            firstFile = file;
        }

        if (file.isNull()) {
            return; // ignore
        }

        if (file.isStream()) {
            skipConversion = true;

            return this.emit('error', new PluginError('Streaming not supported', { showStack: false }));
        }

        try {
            data[config.pathConverter(file)] = config.fileParser(file);
        } catch (err) {
            skipConversion = true;

            return this.emit('error',
                new PluginError(`Error parsing JSON: ${err}, file: ${file.path.slice(file.base.length)}`, { showStack: false }));
        }
    }

    function endStream() {
        if (firstFile && !skipConversion) {
            var joinedPath = path.join(firstFile.base, fileName);

            try {
                var joinedFile = new File({
                    cwd: firstFile.cwd,
                    base: firstFile.base,
                    path: joinedPath,
                    contents: config.dataConverter(data)
                });

                this.emit('data', joinedFile);
            } catch (e) {
                return this.emit('error', new PluginError(e, { showStack: true }));
            }
        }

        this.emit('end');
    }

    return through(bufferContents, endStream);
};
