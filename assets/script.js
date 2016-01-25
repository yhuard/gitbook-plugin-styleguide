function iframeLoaded(el) {
  $(el).removeClass('is-loading');
  $(el).iFrameResize();
}
