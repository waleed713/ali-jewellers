/* home.js : home page only. Featured pieces, hero video and the contact form. */
(function () {
  "use strict";
  var AJ = window.AJ,
    $ = AJ.$;

  // featured pieces: the three ids below are read from products.js
  var feat = $("#featured");
  if (feat) {
    var ids = (feat.getAttribute("data-ids") || "").split(",");
    feat.innerHTML = ids
      .map(function (id) {
        var p = AJ.find(id.trim());
        if (!p) return "";
        return (
          '<article class="card"><a href="' +
          AJ.url(p) +
          '">' +
          AJ.picture(p.img, p.alt, 900, 900) +
          "<h3>" +
          AJ.esc(p.name) +
          "</h3></a><p>" +
          AJ.esc(p.spec) +
          "</p><strong>" +
          AJ.money(p.price) +
          "</strong></article>"
        );
      })
      .join("");
  }

  // some browsers need a nudge to start a muted video
  var v = $(".hero-video");
  if (v) {
    var go = v.play();
    if (go && go.catch) go.catch(function () {});
  }

  // contact form: opens WhatsApp with the message already written
  var f = $("#form"),
    note = $("#note");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(f);
    if (!d.get("name") || !d.get("contact")) {
      note.textContent = "Please add your name and phone number.";
      return;
    }
    var text =
      "Hello, my name is " +
      d.get("name") +
      " (" +
      d.get("contact") +
      ").\nInterested in: " +
      (d.getAll("int").join(", ") || "general enquiry") +
      "\n" +
      (d.get("msg") || "");
    window.open(
      "https://wa.me/" +
        AJ.config.whatsapp +
        "?text=" +
        encodeURIComponent(text),
      "_blank",
    );
    note.textContent = "Opening WhatsApp. Thank you.";
  });
})();
