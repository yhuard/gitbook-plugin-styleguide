function iframeLoaded(el) {
  $(el).removeClass('is-loading');
  $(el).iFrameResize({
    heightCalculationMethod: 'max',
    autoResize: false
  });
}

$('.styleguide .dropdown-menu a').on('click', function (event) {
    $(this).parents('.dropdown').toggleClass('open');
});
