'use strict';

const nunjucks = require('nunjucks');
const path = require('path');
const fm = require('front-matter');
const fs = require('fs');

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(), {
  autoescape: false
});

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
      process: function (blk) {
        if (this.generator === 'website') {
          const tpl = blk.kwargs.tpl;
          const id = blk.kwargs.id ? blk.kwargs.id + '-' : '';
          return template(tpl, id);
        }

        var body = blk.body.trim();
        return '<pre>' + escape(body) + '</pre>';
      }
    }
  }
};

function template(tpl, id) {
  try {
    var buildFile = path.basename(tpl);
    var data = fs.readFileSync(tpl, 'utf8');
    var content = {};

    content = fm(data);
    content.body = content.body || '';
    content.attributes = content.attributes || {};

    // Get sources (SCSS, JS)
    var scriptsToInclude = [];
    if (content.attributes.src && content.attributes.src.scripts) {
      scriptsToInclude = Array.isArray(content.attributes.src.scripts) ?
        content.attributes.src.scripts : [content.attributes.src.scripts];
    }
    var scripts = [];
    scriptsToInclude.forEach(file => {
      var scriptContent = fs.readFileSync(path.resolve(tpl, '..', file));
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
    stylesToInclude.forEach(file => {
      var scriptContent = fs.readFileSync(path.resolve(tpl, '..', file));
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
      url: '/templates/' + buildFile
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
