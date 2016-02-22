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

    // Handles devices sizes
    $('a[data-toggle="pill"]').on('click', function(e) {
      var frameId = $(this).attr('data-trigger');
      var width = $(this).attr('data-width');
      $('#' + frameId).width(width);
    });

    var isOldIE = (navigator.userAgent.indexOf("MSIE") !== -1); // Detect IE10 and below

    iframes.on('load', function() {
      $(this).removeClass('lazy');
      $(this).iFrameResize({
        heightCalculationMethod: isOldIE ? 'max' : 'lowestElement',
        autoResize: true,
        scrolling: true
      });
    });

    // Lightboxes
    $(document).on('lity:ready', function(event, lightbox, trigger) {
      var frameId = $(trigger).attr('data-trigger');
      var width = $('#'+frameId).width();
      $(lightbox).find('.lity-container').width(width);
      $(lightbox).find('iframe').width(width);
      $(lightbox).find('iframe').iFrameResize({
        heightCalculationMethod: isOldIE ? 'max' : 'lowestElement',
        autoResize: true,
        scrolling: true
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
