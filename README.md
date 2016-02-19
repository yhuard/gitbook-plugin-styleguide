# GitBook Style Guide Plugin

This plugin is meant to be used to generate the styleguide for European Commission theme.

## Syntax

In the documentation, you can call the the plugin with the following syntax:

```markdown
{% styleguide './templates/breadcrumb.html' %}{% endstyleguide %}
```

And here's how a template file should look like:

```html
---
src:
  scripts: '../scripts/breadcrumb.js'
  styles:
    - '../styles/_settings.scss'
    - '../styles/_objects.scss'
---
<nav class="breadcrumb" role="navigation" aria-label="breadcrumbs">
  <span class="element-invisible">You are here:</span>
  <ol class="breadcrumb__segments-wrapper">
    <li class="breadcrumb__segment breadcrumb__segment--first">
      <a href="#" class="breadcrumb__link">European Commission</a>
    </li>
    <li class="breadcrumb__segment">
      <a href="#" class="breadcrumb__link">Path 1</a>
    </li>
    <li class="breadcrumb__segment breadcrumb__segment--last">
      <a href="#" class="breadcrumb__link">Path2</a>
    </li>
  </ol>
</nav>
```

You can provide a custom configuration to the plugin in your book.json. Here's the one we use in EC:

```json
{
  ...
  "pluginsConfig": {
    "styleguide": {
      "base": "src",
      "frame": "./tpl/frame.html",
      "sizes": [
        {
          "title": "Desktop",
          "width": "1200px"
        }, {
          "title": "Tablet",
          "width": "800px"
        }, {
          "title": "Phone",
          "width": "380px"
        }
      ]
    }
  }
}
```
