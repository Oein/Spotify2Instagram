import gulp from "gulp";
import GulpUglify from "gulp-uglify";
import ts from "gulp-typescript";
import csso from "gulp-csso";
import htmlmin from "gulp-htmlmin";
import imagemin from "gulp-imagemin";
const tsProject = ts.createProject("tsconfig.json");

const routes = {
  typescript: {
    dest: "build",
  },
};

const typescript = () =>
  tsProject
    .src()
    .pipe(tsProject({}))
    .js.pipe(
      GulpUglify({
        compress: true,
        mangle: true,
      })
    )
    .pipe(gulp.dest(routes.typescript.dest));

const styles = () =>
  gulp.src("./static/css/*").pipe(csso()).pipe(gulp.dest("./build/static/css"));

const htmls = () =>
  gulp
    .src(["./static/*.html"])
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(gulp.dest("./build/static"));

const images = () =>
  gulp
    .src("./static/resources/*")
    .pipe(imagemin())
    .pipe(gulp.dest("./build/static/resources"));

export const type = gulp.series([typescript]);
export const css = gulp.series([styles]);
export const html = gulp.series([htmls]);
export const img = gulp.series([images]);
export const build = gulp.series([typescript, styles, htmls, images]);
