'use strict';

var nunjucks = require('nunjucks');
var path = require('path');
var fm = require('front-matter');
var fs = require('fs');
var q = require('q');
var mkdirp = require('mkdirp');
var defaults = require('lodash/defaults');

function template(tpl, id, currentFile, config, book) {
  try {
    return q()
      .then(function readTemplate() {
        return fs.readFileSync(path.resolve(config.base, path.dirname(currentFile), tpl), 'utf8');
      })
      .then(function processTemplate(data) {
        var content = {};
        var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(), {
          autoescape: false
        });

        content = fm(data);
        content.body = env.renderString(content.body).trim() || '';
        content.attributes = content.attributes || {};

        // Generate template (frame)
        var templateOutputFile = path.resolve(config.dest, path.dirname(currentFile), tpl);
        var frameFile = path.isAbsolute(config.frame) ?
          config.frame :
          path.resolve(book.root, config.frame);

        var templateContent = env.render(frameFile, {
          content: content.body,
          js: content.attributes.js || '',
          staticBase: path.relative(path.dirname(templateOutputFile), config.dest)
        });

        mkdirp.sync(path.dirname(templateOutputFile));
        fs.writeFileSync(templateOutputFile, templateContent);
        // End of: Generate template (frame)

        // Get sources (SCSS, JS)
        var scriptsToInclude = [];
        if (content.attributes.src && content.attributes.src.scripts) {
          scriptsToInclude = Array.isArray(content.attributes.src.scripts) ?
            content.attributes.src.scripts : [content.attributes.src.scripts];
        }
        var scripts = [];
        scriptsToInclude.forEach(function readNextFile(file) {
          var scriptContent = fs.readFileSync(
            path.resolve(config.base, path.dirname(currentFile), path.dirname(tpl), file)
          );
          scripts.push({
            content: scriptContent,
            file: path.basename(file)
          });
        });

        var stylesToInclude = [];
        if (content.attributes.src && content.attributes.src.styles) {
          stylesToInclude = Array.isArray(content.attributes.src.styles) ?
            content.attributes.src.styles : [content.attributes.src.styles];
        }
        var styles = [];
        stylesToInclude.forEach(function readNextFile(file) {
          var scriptContent = fs.readFileSync(
            path.resolve(config.base, path.dirname(currentFile), path.dirname(tpl), file)
          );
          styles.push({
            content: scriptContent,
            file: path.basename(file)
          });
        });

        // Render the whole styleguide section
        return env.render(path.resolve(__dirname, './templates/website.html'), {
          markup: content.body,
          js: content.attributes.js || '',
          scripts: scripts,
          styles: styles,
          id: id,
          url: tpl
        });
      })
      .catch(function logError(err) {
        console.log(err);
        process.exit(1);
      });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

module.exports = {
  website: {
    assets: './assets',
    js: [
      'bootstrap.js',
      'iframeResizer.js',
      'script.js'
    ],
    css: [
      'bootstrap.css'
    ]
  },
  blocks: {
    styleguide: {
      process: function process(blk) {
        var that = this;
        var filename = blk.args[0];
        var id = path.basename(filename, '.html') + '-';

        var config = defaults(this.book.config.get('pluginsConfig.styleguide'), {
          base: this.book.root,
          dest: this.book.options.output,
          frame: path.resolve(__dirname, './templates/frame.html')
        });

        if (this.generator === 'website') {
          return q()
            .then(function write() {
              return template(filename, id, that.ctx.file.path, config, that.book);
            });
        }

        return q()
          .then(function read() {
            return fs.readFileSync(config.base, path.dirname(that.ctx.file.path), filename, 'utf8');
          })
          .then(function write(content) {
            return '<pre><code class="lang-html">' + content + '</code></pre>';
          });
      }
    }
  }
};
