/* core.js : things every page needs. The bag, the side panels (menu, bag, store, account,
   search, welcome popup), the rates bar and a few helpers the other scripts use. */
(function () {
  "use strict";
  var AJ = (window.AJ = window.AJ || {});
  var cfg = AJ.config;
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  AJ.$ = $;
  AJ.$$ = $$;

  /* ---------- helpers ---------- */
  var esc = function (s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  };
  AJ.esc = esc;
  AJ.money = function (n) {
    return "PKR " + Number(n).toLocaleString("en-US");
  };
  AJ.find = function (id) {
    return AJ.products.filter(function (p) {
      return p.id === id;
    })[0];
  };
  AJ.url = function (p) {
    return "product.html?p=" + encodeURIComponent(p.slug);
  };
  AJ.picture = function (name, alt, w, h, lazy) {
    return (
      '<picture><source srcset="assets/img/' +
      name +
      '.webp" type="image/webp">' +
      '<img src="assets/img/' +
      name +
      '.jpg" width="' +
      w +
      '" height="' +
      h +
      '"' +
      (lazy === false ? "" : ' loading="lazy"') +
      ' alt="' +
      esc(alt) +
      '"></picture>'
    );
  };
  AJ.karat = function (p) {
    var m = /^\d+K/.exec(p.spec);
    return m ? m[0] : AJ.cats[p.cat].name.split(" ")[0];
  };
  AJ.card = function (p, actions) {
    var u = AJ.url(p);
    return (
      '<article class="pc" id="' +
      p.id +
      '">' +
      '<a class="pimg" href="' +
      u +
      '" aria-label="' +
      esc(p.name) +
      '">' +
      AJ.picture(p.img, p.alt, 900, 900) +
      '<span class="tag">' +
      AJ.karat(p) +
      "</span></a>" +
      '<div class="pt"><div><h3><a href="' +
      u +
      '">' +
      esc(p.name) +
      "</a></h3><p>" +
      esc(p.spec) +
      "</p></div><strong>" +
      AJ.money(p.price) +
      "</strong></div>" +
      (actions
        ? '<div class="pa"><a class="link" href="' +
          u +
          '">View piece</a><button type="button" class="addb" data-add="' +
          p.id +
          '">Add to bag</button></div>'
        : "") +
      "</article>"
    );
  };

  /* ---------- the bag (kept in localStorage as [{id, q, s}]) ---------- */
  var cart = [],
    listeners = [];
  try {
    cart = JSON.parse(localStorage.getItem("aj_cart") || "[]");
  } catch (e) {
    cart = [];
  }
  function save() {
    try {
      localStorage.setItem("aj_cart", JSON.stringify(cart));
    } catch (e) {}
    badge();
    listeners.forEach(function (fn) {
      fn();
    });
  }
  function badge() {
    var n = $("#bagn");
    if (!n) return;
    var c = AJ.cart.count();
    n.textContent = c;
    n.hidden = !c;
  }
  // one place that knows how to describe a bag line, whether it is a catalogue piece or a custom order
  AJ.info = function (i) {
    if (i.c)
      return { name: i.c.name, sub: i.c.sub, price: i.c.price, img: i.c.img };
    var p = AJ.find(i.id);
    if (!p) return null;
    return {
      name: p.name,
      sub: AJ.cats[p.cat].name + (i.s ? " \u00b7 Size " + i.s : ""),
      price: p.price,
      img: "assets/img/" + p.img + ".jpg",
    };
  };
  AJ.cart = {
    items: function () {
      return cart;
    },
    count: function () {
      return cart.reduce(function (a, i) {
        return a + i.q;
      }, 0);
    },
    total: function () {
      return cart.reduce(function (a, i) {
        var n = AJ.info(i);
        return a + (n ? n.price * i.q : 0);
      }, 0);
    },
    addCustom: function (item, q) {
      cart.push({
        id: "custom-" + Date.now().toString(36),
        q: Math.max(1, parseInt(q, 10) || 1),
        s: "",
        c: item,
      });
      save();
    },
    add: function (id, q, s) {
      q = Math.max(1, parseInt(q, 10) || 1);
      s = s || "";
      var f = cart.filter(function (i) {
        return i.id === id && i.s === s;
      })[0];
      if (f) f.q += q;
      else cart.push({ id: id, q: q, s: s });
      save();
    },
    change: function (id, s, d) {
      var f = cart.filter(function (i) {
        return i.id === id && i.s === s;
      })[0];
      if (!f) return;
      f.q += d;
      if (f.q < 1)
        cart = cart.filter(function (i) {
          return i !== f;
        });
      save();
    },
    remove: function (id, s) {
      cart = cart.filter(function (i) {
        return !(i.id === id && i.s === s);
      });
      save();
    },
    clear: function () {
      cart = [];
      save();
    },
    onChange: function (fn) {
      listeners.push(fn);
    },
  };
  AJ.lineHtml = function (i, big) {
    var n = AJ.info(i);
    if (!n) return "";
    var key = i.id + "|" + i.s;
    return (
      '<div class="' +
      (big ? "ci" : "bi") +
      '"><img src="' +
      n.img +
      '" alt="" width="110" height="110">' +
      "<div><h3>" +
      esc(n.name) +
      "</h3><p>" +
      esc(n.sub) +
      "</p>" +
      '<div class="qty"><button type="button" data-qd="-1" data-k="' +
      key +
      '" aria-label="One less">-</button><input value="' +
      i.q +
      '" readonly aria-label="Quantity"><button type="button" data-qd="1" data-k="' +
      key +
      '" aria-label="One more">+</button></div>' +
      '<button type="button" class="rm" data-rm="' +
      key +
      '">Remove</button></div><div class="tot">' +
      AJ.money(n.price * i.q) +
      "</div></div>"
    );
  };

  /* ---------- side panels ---------- */
  var X =
    '<button class="x" type="button" data-close aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  var pages = [
    ["index.html", "Home"],
    ["gold.html", "Gold"],
    ["diamond.html", "Diamond"],
    ["mens.html", "Men's"],
    ["bridal.html", "Bridal"],
    ["size-chart.html", "Size chart"],
    ["cart.html", "Your bag"],
  ];
  var panels =
    '<div class="ov" id="ov" data-close></div>' +
    '<aside class="pn pn-l" id="p-menu" aria-label="Menu">' +
    X +
    '<div class="mlinks">' +
    pages
      .map(function (p) {
        return '<a href="' + p[0] + '">' + p[1] + "</a>";
      })
      .join("") +
    "</div>" +
    '<div class="mfoot"><button type="button" data-open="store">Find our store</button><a href="tel:' +
    cfg.tel +
    '">' +
    cfg.phone +
    '</a><a href="index.html#contact">Visit or message us</a></div></aside>' +
    '<aside class="pn pn-r" id="p-bag" aria-label="Your bag">' +
    X +
    '<h2>Your bag</h2><div id="bagl" class="bagl"></div>' +
    '<div class="bagf" id="bagf"><div class="sub"><span>Subtotal</span><strong id="bsub"></strong></div><a class="btn" href="checkout.html">Checkout</a><a class="btn btn-ghost" href="cart.html">View bag</a></div></aside>' +
    '<div class="pn pn-m" id="p-store" role="dialog" aria-label="Our store">' +
    X +
    "<h2>Visit our store</h2><p>" +
    cfg.address +
    "</p><p>" +
    cfg.hours +
    "</p>" +
    '<div class="mrow"><a class="btn" target="_blank" rel="noopener" href="' +
    cfg.mapUrl +
    '">Open in Google Maps</a><a class="btn btn-ghost" href="tel:' +
    cfg.tel +
    '">Call the store</a></div></div>' +
    '<div class="pn pn-m" id="p-account" role="dialog" aria-label="Account">' +
    X +
    '<h2>Your account</h2><div class="tabs"><button type="button" class="on" data-tab="in">Sign in</button><button type="button" data-tab="up">Create account</button></div>' +
    '<form class="afm" id="aform" novalidate><label id="aname">Name<input name="an" autocomplete="name"></label><label>Email<input name="ae" type="email" autocomplete="email" required></label><label>Password<input name="ap" type="password" autocomplete="current-password" required></label><button class="btn" type="submit">Continue</button><p class="note" id="anote" role="status"></p></form></div>' +
    '<div class="pn pn-s" id="p-search" role="dialog" aria-label="Search">' +
    X +
    '<label class="sbox"><span>Search jewellery</span><input id="sq" type="search" placeholder="Necklace, earrings, ring" autocomplete="off"></label><div id="sres" class="sres"></div></div>' +
    '<div class="pn pn-m pop" id="p-popup" role="dialog" aria-label="Welcome offer">' +
    X +
    '<div class="pop-i">' +
    AJ.picture("bridal-tile", "", 1152, 1440) +
    '</div><div class="pop-t"><img class="pmk" src="assets/img/logo-mark-dark.png" alt="" height="46">' +
    "<h2>Welcome to " +
    cfg.brand +
    "</h2><p>Book a free design consultation and get 10% off making charges on your first order.</p>" +
    '<form class="pf" id="pform" novalidate><label>Phone number<input name="pp" type="tel" autocomplete="tel" placeholder="0300 0000000"></label><button class="btn" type="submit">Claim my offer</button><p class="note" id="pnote" role="status"></p></form><button class="link" type="button" data-close>No thanks</button></div></div>';
  document.body.insertAdjacentHTML("beforeend", panels);

  var ov = $("#ov"),
    openP = null,
    lastFocus = null;
  function show(id) {
    var p = $("#p-" + id);
    if (!p) return;
    hide(true);
    lastFocus = document.activeElement;
    p.classList.add("open");
    ov.classList.add("open");
    document.body.classList.add("lock");
    openP = p;
    if (id === "bag") renderBag();
    if (id === "search") runSearch();
    setTimeout(function () {
      var t = id === "search" ? $("#sq") : $("input,.x", p);
      if (t && t.focus) t.focus();
    }, 150);
  }
  function hide(keep) {
    if (openP) {
      openP.classList.remove("open");
      openP = null;
    }
    if (!keep) {
      ov.classList.remove("open");
      document.body.classList.remove("lock");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
  }
  AJ.show = show;
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hide();
  });

  document.addEventListener("click", function (e) {
    var t = e.target,
      o = t.closest("[data-open]");
    if (o) {
      e.preventDefault();
      show(o.getAttribute("data-open"));
      return;
    }
    if (t.closest("[data-close]")) {
      var wasPop = openP && openP.id === "p-popup";
      hide();
      if (wasPop) markPopup();
      return;
    }
    var a = t.closest("[data-add]");
    if (a) {
      AJ.cart.add(a.getAttribute("data-add"), 1, "");
      var old = a.textContent;
      a.textContent = "Added";
      setTimeout(function () {
        a.textContent = old;
      }, 1200);
      show("bag");
      return;
    }
    var q = t.closest("[data-qd]");
    if (q) {
      var k = q.getAttribute("data-k").split("|");
      AJ.cart.change(k[0], k[1], parseInt(q.getAttribute("data-qd"), 10));
      return;
    }
    var r = t.closest("[data-rm]");
    if (r) {
      var k2 = r.getAttribute("data-rm").split("|");
      AJ.cart.remove(k2[0], k2[1]);
      return;
    }
    if (t.closest("#p-menu a")) hide();
  });

  function renderBag() {
    var l = $("#bagl"),
      f = $("#bagf");
    if (!cart.length) {
      l.innerHTML = "<p>Your bag is empty.</p>";
      f.style.display = "none";
      return;
    }
    f.style.display = "";
    l.innerHTML = cart
      .map(function (i) {
        return AJ.lineHtml(i, false);
      })
      .join("");
    $("#bsub").textContent = AJ.money(AJ.cart.total());
  }
  AJ.cart.onChange(function () {
    if (openP && openP.id === "p-bag") renderBag();
  });
  badge();

  /* ---------- search ---------- */
  var sq = $("#sq"),
    sres = $("#sres");
  function runSearch() {
    var q = sq.value.trim().toLowerCase();
    var r = AJ.products.filter(function (p) {
      return (
        !q ||
        (p.name + " " + p.spec + " " + AJ.cats[p.cat].name)
          .toLowerCase()
          .indexOf(q) > -1
      );
    });
    sres.innerHTML = r.length
      ? r
          .map(function (p) {
            return (
              '<a href="' +
              AJ.url(p) +
              '"><img src="assets/img/' +
              p.img +
              '.jpg" alt="" width="64" height="64"><div><h3>' +
              esc(p.name) +
              "</h3><p>" +
              AJ.cats[p.cat].name +
              " &middot; " +
              AJ.money(p.price) +
              "</p></div></a>"
            );
          })
          .join("")
      : "<p>Nothing matches that. Try gold, diamond, ring or earrings.</p>";
  }
  sq.addEventListener("input", runSearch);

  /* ---------- account (front end only for now) ---------- */
  var af = $("#aform"),
    aname = $("#aname");
  aname.style.display = "none";
  $$(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".tabs button").forEach(function (x) {
        x.classList.remove("on");
      });
      b.classList.add("on");
      aname.style.display =
        b.getAttribute("data-tab") === "up" ? "grid" : "none";
    });
  });
  af.addEventListener("submit", function (e) {
    e.preventDefault();
    $("#anote").textContent =
      !af.elements.ae.value || !af.elements.ap.value
        ? "Please enter your email and password."
        : "Online accounts are opening soon. We have noted your interest.";
  });

  /* ---------- welcome popup: opens once per visit (5 seconds in), never on cart or checkout.
     The small "10% off" tab at the bottom left opens it again whenever someone wants it. ---------- */
  function markPopup() {
    try {
      sessionStorage.setItem("aj_pop_seen", "1");
    } catch (e) {}
  }
  $("#pform").addEventListener("submit", function (e) {
    e.preventDefault();
    var digits = e.target.elements.pp.value.replace(/\D/g, ""),
      n = $("#pnote");
    if (digits.length < 10) {
      n.textContent = "Please enter a valid phone number.";
      return;
    }
    markPopup();
    n.textContent =
      "Thank you. Use code ALI10 at checkout. We will call you to book your consultation.";
  });
  if (!document.body.hasAttribute("data-nopop")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button type="button" class="offer" data-open="popup">10% off</button>',
    );
    var seen = false;
    try {
      seen = sessionStorage.getItem("aj_pop_seen") === "1";
    } catch (e) {}
    if (!seen)
      setTimeout(function () {
        if (!openP) {
          show("popup");
          markPopup();
        }
      }, 5000);
  }

  /* ---------- rates bar ---------- */
  var track = $(".track");
  if (track && AJ.rates) {
    var h =
      AJ.rates.items
        .map(function (i) {
          return (
            '<span class="ti">' +
            i.label +
            " &mdash; " +
            i.type +
            ": " +
            i.value +
            "</span>"
          );
        })
        .join("") +
      '<span class="ti">' +
      AJ.rates.note +
      "</span>";
    track.innerHTML = h + h;
  }
})();
