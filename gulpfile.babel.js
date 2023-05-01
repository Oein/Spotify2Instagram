import gulp from "gulp";
import GulpUglify from "gulp-uglify";
import ts from "gulp-typescript";
const tsProject = ts.createProject("tsconfig.json");

const routes = {
  typescript: {
    dest: "distTS",
  },
};

const typescript = () =>
  tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(GulpUglify())
    .pipe(gulp.dest(routes.typescript.dest));

export const build = gulp.series(typescript);
