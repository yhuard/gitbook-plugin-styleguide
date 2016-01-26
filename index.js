'use strict';

var nunjucks = require('nunjucks');
var path = require('path');
var fm = require('front-matter');
var fs = require('fs');
var q = require('q');
var mkdirp = require('mkdirp');
var defaults = require('lodash/defaults');

function template(tpl, id, currentFile, config) {
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
        content.body = content.body || '';
        content.attributes = content.attributes || {};

        // Generate template (frame)
        var frameStyles = [];
        if (content.attributes.demo && content.attributes.demo.styles) {
          frameStyles = Array.isArray(content.attributes.demo.styles) ?
            content.attributes.demo.styles : [content.attributes.demo.styles];
        }
        var frameScripts = [];
        if (content.attributes.demo && content.attributes.demo.scripts) {
          frameScripts = Array.isArray(content.attributes.demo.scripts) ?
            content.attributes.demo.scripts : [content.attributes.demo.scripts];
        }

        var templateOutputFile = path.resolve(config.dest, path.dirname(currentFile), tpl);
        var templateContent = env.render(path.resolve(__dirname, './templates/frame.html'), {
          content: content.body,
          styles: frameStyles,
          scripts: frameScripts,
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
        var id = blk.kwargs.id ? blk.kwargs.id + '-' : '';

        var config = defaults(this.book.config.get('pluginsConfig.styleguide'), {
          base: this.book.root,
          dest: this.book.options.output
        });

        if (this.generator === 'website') {
          return q()
            .then(function write() {
              return template(filename, id, that.ctx.file.path, config);
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
