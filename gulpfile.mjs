import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import htmlmin from './htmlmin.js';
import htmlclean from 'gulp-htmlclean';
import gulp from 'gulp';

gulp.task('minify-css', function () {
    return gulp.src('./public/**/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./public'));
});

gulp.task('minify-html', function () {
    return gulp.src('./public/**/*.html')
        .pipe(htmlclean())
        .pipe(htmlmin({
            removeComments: true,
            minifyJS: true,
            cleanCSS: true,
            minifyURLs: true,
        }))
        .pipe(gulp.dest('./public'));
});

gulp.task('minify-js', function () {
    return gulp.src(['./public/**/*.js', '!./public/**/*.min.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./public'));
});

gulp.task('default',
    gulp.series(gulp.parallel(
        'minify-html',
        'minify-css',
        'minify-js',
    )),
    function () {
        console.log("----------gulp Finished----------");
    });
