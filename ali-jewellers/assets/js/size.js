/* size.js : the size and weight chart.
   Pick a category, a type, a karat and a size and it works out an estimated weight and price,
   shows the full weight chart for that category, and lets the customer order it.

   How the numbers are worked out
   - rings, bangles, chains and bracelets: volume of gold (size x width x thickness) times the
     density of the karat, so a bigger size or a heavier style gives a heavier piece
   - earrings and pendants: typical weights for small, medium and large, scaled by karat
   - price = weight x today's 24K rate per gram x purity of the karat + making charges
   These are estimates (about plus or minus 5%). The final price is confirmed by the shop. */
(function () {
  "use strict";
  var AJ = window.AJ,
    $ = AJ.$,
    $$ = AJ.$$,
    PI = Math.PI,
    TOLA = 11.664;
  var DENSITY = { "24K": 19.3, "22K": 17.7, "21K": 16.9, "18K": 15.5 };
  var PURITY = { "24K": 1, "22K": 0.9167, "21K": 0.875, "18K": 0.75 };
  var RING_D = {
    5: 15.7,
    6: 16.5,
    7: 17.3,
    8: 18.2,
    9: 19.0,
    10: 19.8,
    11: 20.6,
    12: 21.4,
    13: 22.2,
  }; // inner diameter, mm
  var BANGLE_D = { 2.2: 57.2, 2.4: 63.5, 2.6: 69.9, 2.8: 76.2 }; // inner diameter, mm
  var CHAIN_NOTE = {
    16: "choker",
    18: "sits at the collarbone",
    20: "just below the collarbone",
    22: "mid chest",
    24: "long",
    26: "long",
    28: "extra long",
    30: "extra long",
  };
  var range = function (a, b, s) {
    var r = [];
    for (var x = a; x <= b + 0.001; x += s) r.push(x);
    return r;
  };

  // band(): a ring or bangle. width and thickness in mm, fill allows for the rounded profile.
  function band(w, t, fill, extra) {
    return function (dia, k) {
      return (
        ((PI * (dia + t) * w * t * fill) / 1000) * DENSITY[k] +
        ((extra || 0) * DENSITY[k]) / 17.7
      );
    };
  }
  // wire(): a chain or bracelet. thickness of the link wire in mm, fill allows for the gaps between links.
  function wire(mm, fill) {
    return function (len, k) {
      return (
        ((len * 25.4 * PI * Math.pow(mm / 2, 2) * fill) / 1000) * DENSITY[k]
      );
    };
  }
  // fixed(): earrings and pendants, weights for S, M and L at 22K
  function fixed(s, m, l) {
    var b = { S: s, M: m, L: l };
    return function (size, k) {
      return (b[size] * DENSITY[k]) / 17.7;
    };
  }

  var CATS = {
    ring: {
      name: "Rings",
      img: "braided-gold-ring",
      sizeTitle: "Ring size (US)",
      unit: "US size",
      sizes: range(5, 13, 1).map(function (n) {
        return { v: n, label: String(n), dia: RING_D[n] };
      }),
      detail: function (s) {
        return (
          "Inside diameter " +
          s.dia.toFixed(1) +
          " mm, " +
          (PI * s.dia).toFixed(1) +
          " mm around"
        );
      },
      types: [
        {
          id: "plain",
          name: "Plain band",
          desc: "Slim, everyday wear",
          make: 0.1,
          f: band(3.5, 1.5, 0.85),
        },
        {
          id: "wide",
          name: "Wide band",
          desc: "Broad and comfortable",
          make: 0.1,
          f: band(6, 1.8, 0.85),
        },
        {
          id: "heavy",
          name: "Men's heavy ring",
          desc: "Thick and solid",
          make: 0.12,
          f: band(8, 2.3, 0.85),
        },
        {
          id: "stone",
          name: "Stone ring",
          desc: "Slim band with a setting",
          make: 0.15,
          f: band(2.5, 1.4, 0.85, 0.9),
        },
      ],
    },
    bangle: {
      name: "Bangles",
      img: "bridal-bangles",
      sizeTitle: "Bangle size",
      unit: "Size",
      sizes: ["2.2", "2.4", "2.6", "2.8"].map(function (n) {
        return { v: n, label: n, dia: BANGLE_D[n] };
      }),
      detail: function (s) {
        return (
          "Inside diameter " +
          s.dia.toFixed(1) +
          " mm (" +
          (s.dia / 25.4).toFixed(2) +
          " in)"
        );
      },
      types: [
        {
          id: "patla",
          name: "Patla (thin)",
          desc: "Light, for stacking",
          make: 0.12,
          f: band(3.5, 1.5, 0.9),
        },
        {
          id: "kara",
          name: "Kara (plain)",
          desc: "Classic plain bangle",
          make: 0.1,
          f: band(5, 2, 0.9),
        },
        {
          id: "broad",
          name: "Bridal broad",
          desc: "Wide and heavy",
          make: 0.14,
          f: band(8, 2.5, 0.9),
        },
      ],
    },
    chain: {
      name: "Chains",
      img: "emerald-pendant",
      sizeTitle: "Chain length",
      unit: "Length",
      sizes: range(16, 30, 2).map(function (n) {
        return { v: n, label: n + " in", len: n };
      }),
      detail: function (s) {
        return (
          s.len +
          " in (" +
          (s.len * 2.54).toFixed(0) +
          " cm), " +
          CHAIN_NOTE[s.len]
        );
      },
      types: [
        {
          id: "rope",
          name: "Rope chain",
          desc: "Fine, 1.6 mm",
          make: 0.09,
          f: wire(1.6, 0.5),
        },
        {
          id: "curb",
          name: "Curb chain",
          desc: "Classic, 2.8 mm",
          make: 0.08,
          f: wire(2.8, 0.42),
        },
        {
          id: "heavy",
          name: "Heavy box chain",
          desc: "Bold, 4.2 mm",
          make: 0.09,
          f: wire(4.2, 0.4),
        },
      ],
    },
    bracelet: {
      name: "Bracelets",
      img: "gold-cuff",
      sizeTitle: "Bracelet length",
      unit: "Length",
      sizes: range(6.5, 8.5, 0.5).map(function (n) {
        return { v: n, label: n + " in", len: n };
      }),
      detail: function (s) {
        return (
          s.len + " in (" + (s.len * 2.54).toFixed(1) + " cm) around the wrist"
        );
      },
      types: [
        {
          id: "fine",
          name: "Fine chain",
          desc: "Light, 1.8 mm",
          make: 0.1,
          f: wire(1.8, 0.45),
        },
        {
          id: "curb",
          name: "Curb link",
          desc: "Classic, 3.6 mm",
          make: 0.09,
          f: wire(3.6, 0.42),
        },
        {
          id: "heavy",
          name: "Heavy link",
          desc: "Bold, 5.4 mm",
          make: 0.1,
          f: wire(5.4, 0.4),
        },
      ],
    },
    earring: {
      name: "Earrings",
      img: "jhumka",
      sizeTitle: "Size",
      unit: "Size",
      sizes: [
        { v: "S", label: "Small", note: "about 15 mm long" },
        { v: "M", label: "Medium", note: "about 25 mm long" },
        { v: "L", label: "Large", note: "about 40 mm long" },
      ],
      detail: function (s) {
        return s.label + ", " + s.note;
      },
      types: [
        {
          id: "stud",
          name: "Studs",
          desc: "Sit on the ear",
          make: 0.12,
          f: fixed(1.2, 2, 3.2),
        },
        {
          id: "hoop",
          name: "Hoops",
          desc: "Round and light",
          make: 0.12,
          f: fixed(2.5, 4.5, 7.5),
        },
        {
          id: "drop",
          name: "Drops",
          desc: "Hang below the lobe",
          make: 0.14,
          f: fixed(3.5, 6, 9),
        },
        {
          id: "jhumka",
          name: "Jhumkas",
          desc: "Bell shaped",
          make: 0.14,
          f: fixed(5, 9, 14),
        },
      ],
    },
    pendant: {
      name: "Pendants",
      img: "antique",
      sizeTitle: "Size",
      unit: "Size",
      sizes: [
        { v: "S", label: "Small", note: "about 15 mm" },
        { v: "M", label: "Medium", note: "about 25 mm" },
        { v: "L", label: "Large", note: "about 35 mm" },
      ],
      detail: function (s) {
        return s.label + ", " + s.note;
      },
      types: [
        {
          id: "plain",
          name: "Plain",
          desc: "Simple shape",
          make: 0.12,
          f: fixed(1.5, 3, 5.5),
        },
        {
          id: "stone",
          name: "With stone",
          desc: "One stone set",
          make: 0.15,
          f: fixed(2, 3.5, 6),
        },
        {
          id: "locket",
          name: "Locket",
          desc: "Opens, holds a photo",
          make: 0.12,
          f: fixed(3, 6, 10),
        },
      ],
    },
  };

  var q = new URLSearchParams(location.search).get("c");
  var st = {
    cat: CATS[q] ? q : "ring",
    type: null,
    karat: "22K",
    size: null,
    qty: 1,
  };
  var $cat = $("#s-cat"),
    $type = $("#s-type"),
    $karat = $("#s-karat"),
    $size = $("#s-size");

  function sizeObj() {
    var c = CATS[st.cat];
    return (
      c.sizes.filter(function (s) {
        return String(s.v) === String(st.size);
      })[0] || c.sizes[0]
    );
  }
  function typeObj() {
    var c = CATS[st.cat];
    return (
      c.types.filter(function (t) {
        return t.id === st.type;
      })[0] || c.types[0]
    );
  }
  function weightOf(t, s, k) {
    var c = CATS[st.cat];
    return t.f(
      c.sizes[0].dia !== undefined ? s.dia : s.len !== undefined ? s.len : s.v,
      k,
    );
  }
  function round(n, step) {
    return Math.round(n / step) * step;
  }
  function pill(label, on, data) {
    return (
      '<button type="button" class="pill" aria-pressed="' +
      on +
      '" ' +
      data +
      ">" +
      label +
      "</button>"
    );
  }

  function choose(group, container, items, current, dataName) {
    container.innerHTML = items
      .map(function (it) {
        return pill(
          it.label,
          String(it.v) === String(current),
          "data-" + dataName + '="' + it.v + '"',
        );
      })
      .join("");
  }

  function render() {
    var c = CATS[st.cat];
    if (
      !c.types.some(function (t) {
        return t.id === st.type;
      })
    )
      st.type = c.types[0].id;
    if (
      !c.sizes.some(function (s) {
        return String(s.v) === String(st.size);
      })
    )
      st.size = c.sizes[Math.min(3, c.sizes.length - 1)].v;
    var t = typeObj(),
      s = sizeObj();

    choose(
      "cat",
      $cat,
      Object.keys(CATS).map(function (k) {
        return { v: k, label: CATS[k].name };
      }),
      st.cat,
      "cat",
    );
    $type.innerHTML = c.types
      .map(function (x) {
        return (
          '<button type="button" class="tc" aria-pressed="' +
          (x.id === st.type) +
          '" data-type="' +
          x.id +
          '"><b>' +
          x.name +
          "</b><small>" +
          x.desc +
          "</small></button>"
        );
      })
      .join("");
    choose(
      "karat",
      $karat,
      Object.keys(DENSITY).map(function (k) {
        return { v: k, label: k };
      }),
      st.karat,
      "karat",
    );
    choose("size", $size, c.sizes, st.size, "size");
    $("#s-sizetitle").textContent = c.sizeTitle;
    $("#s-picked").textContent = c.detail(s);

    // numbers
    var g = weightOf(t, s, st.karat);
    var rate = AJ.rates.gold24Tola / TOLA;
    var gold = g * rate * PURITY[st.karat],
      making = gold * t.make;
    var unit = round(gold + making, 500),
      total = unit * st.qty;
    $("#r-title").textContent = c.name.replace(/s$/, "") + ": " + t.name;
    $("#r-sub").textContent =
      st.karat + " gold, " + s.label + (c.unit === "US size" ? " (US)" : "");
    $("#r-size").textContent = c.detail(s);
    $("#r-weight").textContent =
      g.toFixed(1) + " g (" + (g / TOLA).toFixed(2) + " tola)";
    $("#r-gold").textContent = AJ.money(round(gold, 100));
    $("#r-make").textContent =
      AJ.money(round(making, 100)) + " (" + Math.round(t.make * 100) + "%)";
    $("#r-unit").textContent = st.qty > 1 ? AJ.money(unit) + " each" : "";
    $("#r-total").textContent = AJ.money(total);
    $("#r-q").value = st.qty;
    $("#r-rate").textContent = AJ.money(AJ.rates.gold24Tola);

    // full weight chart for this category and karat
    var rows = c.sizes
      .map(function (sz) {
        return (
          '<tr><th scope="row">' +
          sz.label +
          "</th>" +
          c.types
            .map(function (ty) {
              var on = ty.id === t.id && String(sz.v) === String(s.v);
              return (
                "<td" +
                (on ? ' class="on"' : "") +
                ">" +
                weightOf(ty, sz, st.karat).toFixed(1) +
                " g</td>"
              );
            })
            .join("") +
          "</tr>"
        );
      })
      .join("");
    $("#wchart").innerHTML =
      "<caption>" +
      c.name +
      " weight chart at " +
      st.karat +
      ' (grams)</caption><thead><tr><th scope="col">' +
      c.unit +
      "</th>" +
      c.types
        .map(function (ty) {
          return '<th scope="col">' + ty.name + "</th>";
        })
        .join("") +
      "</tr></thead><tbody>" +
      rows +
      "</tbody>";
    return { c: c, t: t, s: s, g: g, unit: unit, total: total };
  }

  var cur = render();

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat],[data-type],[data-karat],[data-size]");
    if (b) {
      if (b.dataset.cat) {
        st.cat = b.dataset.cat;
        st.type = null;
        st.size = null;
      }
      if (b.dataset.type) st.type = b.dataset.type;
      if (b.dataset.karat) st.karat = b.dataset.karat;
      if (b.dataset.size) st.size = b.dataset.size;
      cur = render();
      return;
    }
    var d = e.target.closest("[data-sq]");
    if (d) {
      st.qty = Math.max(1, st.qty + parseInt(d.getAttribute("data-sq"), 10));
      cur = render();
    }
  });

  function describe() {
    return (
      cur.c.name.replace(/s$/, "") +
      " (" +
      cur.t.name +
      "), " +
      st.karat +
      ", " +
      cur.s.label +
      (cur.c.unit === "US size" ? " US" : "") +
      ", approx. " +
      cur.g.toFixed(1) +
      " g"
    );
  }

  $("#r-add").addEventListener("click", function () {
    AJ.cart.addCustom(
      {
        name:
          "Custom " +
          cur.c.name.replace(/s$/, "").toLowerCase() +
          ": " +
          cur.t.name,
        sub:
          st.karat +
          " \u00b7 " +
          cur.s.label +
          " \u00b7 approx. " +
          cur.g.toFixed(1) +
          " g",
        price: cur.unit,
        img: "assets/img/" + cur.c.img + ".jpg",
      },
      st.qty,
    );
    AJ.show("bag");
  });
  $("#r-wa").addEventListener("click", function () {
    var text =
      "Hello, I would like to order a custom piece:\n" +
      describe() +
      "\nQuantity: " +
      st.qty +
      "\nEstimated price: " +
      AJ.money(cur.total);
    window.open(
      "https://wa.me/" +
        AJ.config.whatsapp +
        "?text=" +
        encodeURIComponent(text),
      "_blank",
    );
  });
})();
