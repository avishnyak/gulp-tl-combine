[![npm version](https://badge.fury.io/js/gulp-tl-combine.svg)](https://badge.fury.io/js/gulp-tl-combine)

# gulp-tl-combine

> TurnsLift plugin for [gulp](https://github.com/wearefractal/gulp).

The purpose of this gulp plugin is to combine data definition files used in the TurnsLift platform into a standard
 JSON representation.  This representation is the format expected by the TurnsLift platform to merge and upgrade schemas,
 queries and views for data access.

## Usage

First, install `gulp-tl-combine` as a development dependency:

```shell
npm install --save-dev gulp-tl-combine
```

Then, add it to your `gulpfile.js`:

```javascript
var tlcombine = require("gulp-tl-combine");

gulp.src("./src/*.json")
	.pipe(tlcombine("output_file_name.json"))
	.pipe(gulp.dest("./dist"));
```

Create the following directory structure in your application.  Files placed into these directories will be processed
by this plugin into the desired output file.

```
|- data
  |- entities
  | |- (json schema files)...
  |- entity-patches
  | |- (entity-patch files)...
  |- queries
  | |- (SQL query statements in files that end with *.sql extension)
  |- views
  | |- (json design documents containing view definitions)
```

## API

### jsoncombine(fileName, options)

#### fileName
Type: `String`  

The output filename

#### options.dataConverter(data)
Type: `Function`

This function acts as a reducer function.  All of the collected data is passed into this function as the data object when
the stream is closed.  The keys of the data object will be the names of the files (sans the '.json' postfix).

The function should return a new `Buffer` that would be writter to the output file.

#### options.pathConverter(file)
Type: `Function`

file is just [vinyl](https://github.com/gulpjs/vinyl)

This function can be used to transform physical file names into some other key.  This function should return a `String` that
will become the key of the data object passed to `dataConverter`.

#### options.fileParser(file)
Type: `Function`

file is just [vinyl](https://github.com/gulpjs/vinyl)

This function is responsible for reading a given file and returning proper JSON that can be used as the value assigned
to the data object send to `dataConverter`.


## License

See LICENSE file for details.
