let gulp = require('gulp');
let tsb = require('gulp-tsb');
let clean = require('gulp-clean');

// TypeScript build for /src folder
let tsConfigSrc = tsb.create('tsconfig.json');
gulp.task('build', function () {
	return gulp.src('./src/**/*.ts')
		.pipe(tsConfigSrc())
		.pipe(gulp.dest('./dist'));
});

// watch for any TypeScript file changes
// if a file change is detected, run the TypeScript compile gulp tasks
gulp.task('watch', function () {
	gulp.watch('src/**/*.ts', ['build']);
});

gulp.task('clean', function () {
	return gulp.src('./dist', {read: false})
		.pipe(clean());
});

gulp.task('default', ['clean', 'build']);
