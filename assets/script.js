require(["gitbook"], function(gitbook) {
  function onPageLoad() {
    // Close dropdown menu on click
    $('.styleguide .dropdown-menu a').on('click', function(event) {
      $(this).parents('.dropdown').toggleClass('open');
    });

    // Handle iframes
    var iframes = $('iframe');
    iframes.attr('src', function() {
      var src = $(this).attr('data-src');
      $(this).removeAttr('data-src');
      return src;
    });
    iframes.on('load', function() {
      $(this).removeClass('lazy');
      $(this).iFrameResize({
        heightCalculationMethod: 'max',
        autoResize: false
      });
    });
  }

  // "page.change" is triggered on first load, but due to a Chrome bug we have to prevent it
  // in order to make the style guide run from the silesystem
  var loadedOnce = false;
  gitbook.events.bind("page.change", function() {
    if (loadedOnce) {
      onPageLoad();
    } else {
      loadedOnce = true;
    }
  });

  // Make sure to run this function at least once
  onPageLoad();
});
