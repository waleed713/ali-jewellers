/* reveal.js : the scroll animations (images wipe in, text fades up, hero images drift).
   Pages that build content with JS call AJ.reveal() again after they render. */
(function () {
  "use strict";
  var AJ = (window.AJ = window.AJ || {});
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = null;
  if (!reduce && "IntersectionObserver" in window) {
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
  }
  AJ.reveal = function (root) {
    root = root || document;
    var text = root.querySelectorAll(
      ".rv,.head,.trio>div,.banner-copy,.split-copy h2,.gr",
    );
    var pics = root.querySelectorAll(".pimg,.tile,.v-img,.split");
    Array.prototype.forEach.call(text, function (el) {
      el.classList.add("rv");
      if (io) io.observe(el);
      else el.classList.add("in");
    });
    Array.prototype.forEach.call(pics, function (el) {
      if (io) io.observe(el);
      else el.classList.add("in");
    });
  };
  AJ.reveal();

  if (reduce) return;
  var layers = Array.prototype.slice.call(
      document.querySelectorAll(".phero,.band,.banner,.split,.v-img"),
    ),
    ticking = false;
  if (!layers.length) return;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    layers.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      s.style.setProperty(
        "--py",
        (-((r.top + r.height / 2 - vh / 2) / vh) * 70).toFixed(1) + "px",
      );
    });
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
})();
