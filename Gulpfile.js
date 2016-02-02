const gulp = require('gulp'),
    babel = require('gulp-babel'),
    $ = require('gulp-load-plugins')();

require('babel-core/register');

gulp.task('tests', ['default'], ()=> {
    return gulp.src('test/main.js', { read: false })
               .pipe($.mocha({ reporter: 'spec' }));
});

gulp.task('default', ()=> {
    return gulp.src('index.js')
               // Run Code Validation
               .pipe($.jscs())
               .pipe($.jscs.reporter())
               .pipe($.jscs.reporter('fail'))

               // Transpile Code
               .pipe(babel({
                   presets: ['es2015']
               }))
               .pipe(gulp.dest('dist'));
});
