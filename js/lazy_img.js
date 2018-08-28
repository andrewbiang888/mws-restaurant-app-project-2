window.initLazyImg = function () {
  var imgDefer = document.getElementsByTagName('img');
  setTimeout(function(){ 
    for (var i=0; i < imgDefer.length; i++) {
      if ( imgDefer[i].getAttribute('data-src') ) {
        imgDefer[i].setAttribute('src',imgDefer[i].getAttribute('data-src'));
        if ( imgDefer[i].getAttribute('data-srcset') ) {
          imgDefer[i].setAttribute('srcset',imgDefer[i].getAttribute('data-srcset'));
        }
      } 
    } 
  }, 300);
}
window.initLazyImg = initLazyImg();
window.onload = initLazyImg;