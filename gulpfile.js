// プラグイン読み込み
const { src, dest, watch, parallel, series} = require("gulp")
const sass = require("gulp-sass")
const prefix = require("gulp-autoprefixer")
const plumber = require("gulp-plumber")
const notify = require("gulp-notify")
const changed = require("gulp-changed")

const filepath = {
  src: "./src/",
}

const filesrc = {
  scss: `${filepath.src}**/*.scss`,
}

/**
 * Sassコンパイル
 */
const compileSass = (done) => {
  return src([filesrc.scss]) // scssファイルを取得
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    // .pipe(changed(`${filepath.src}`))
    .pipe(sass({outputStyle: "expanded"})) // Sassのコンパイルを実行,コンパイル設定
    .pipe(prefix(["last 2 versions"]))
    .pipe(dest(`${filepath.src}`)) // cssフォルダー以下に保存
}

/**
 * ファイル監視
 */
const watchFiles = (done) => {
  watch([filesrc.scss], {}, series(compileSass))
  done()
}

// gulpデフォルトタスク
exports.default = series(parallel(compileSass), watchFiles)
