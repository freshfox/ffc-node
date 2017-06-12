let gulp = require('gulp');
let tsb = require('gulp-tsb');

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

gulp.task('default', ['build']);
