/* product.js : the single product template. product.html?p=some-slug shows that product.
   One layout for every piece; the details come from products.js. It also writes the
   page title, description, canonical link and structured data so search engines see
   the right product on each address. */
(function () {
  "use strict";
  var AJ = window.AJ,
    $ = AJ.$,
    cfg = AJ.config;
  var slug = new URLSearchParams(location.search).get("p");
  var p = AJ.products.filter(function (x) {
    return x.slug === slug;
  })[0];
  var root = $("#pdp");

  if (!p) {
    document.title = "Piece not found | " + cfg.brand;
    var robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    root.outerHTML =
      '<section class="missing"><h1>We could not find that piece</h1><p>It may have been sold or the link is old.</p><a class="btn" href="index.html#collections">See the collections</a></section>';
    $("#related").remove();
    return;
  }

  var cat = AJ.cats[p.cat],
    pageUrl = cfg.domain + "/product.html?p=" + p.slug;
  var spec = p.spec.charAt(0).toLowerCase() + p.spec.slice(1);
  var desc = p.name + " in " + spec + ". " + cat.about;

  /* head: title, description, canonical, social tags, structured data */
  document.title = p.name + " | " + cat.name + " in Karachi | " + cfg.brand;
  function meta(sel, attr, val) {
    var el = $(sel);
    if (el) el.setAttribute(attr, val);
  }
  meta('meta[name="description"]', "content", desc.slice(0, 158));
  meta('link[rel="canonical"]', "href", pageUrl);
  meta('meta[property="og:title"]', "content", p.name + " | " + cfg.brand);
  meta('meta[property="og:description"]', "content", desc.slice(0, 158));
  meta(
    'meta[property="og:image"]',
    "content",
    cfg.domain + "/assets/img/" + p.img + ".jpg",
  );
  meta('meta[property="og:url"]', "content", pageUrl);
  var ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: desc,
      image: cfg.domain + "/assets/img/" + p.img + ".jpg",
      category: cat.name,
      brand: { "@type": "Brand", name: cfg.brand },
      offers: {
        "@type": "Offer",
        priceCurrency: "PKR",
        price: String(p.price),
        availability: "https://schema.org/InStock",
        url: pageUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: cfg.domain + "/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: cat.name,
          item: cfg.domain + "/" + cat.page,
        },
        { "@type": "ListItem", position: 3, name: p.name, item: pageUrl },
      ],
    },
  ]);
  document.head.appendChild(ld);

  /* size picker only where it makes sense */
  var sizes = {
    ring: ["6", "7", "8", "9", "10", "11", "12", "13"],
    bangle: ["2.2", "2.4", "2.6", "2.8"],
  }[p.size];
  var sizeHtml = sizes
    ? '<label class="sel">' +
      (p.size === "ring" ? "Ring size" : "Bangle size") +
      '<select id="psize">' +
      sizes
        .map(function (s) {
          return "<option>" + s + "</option>";
        })
        .join("") +
      '</select><a class="link" href="size-chart.html?c=' +
      p.size +
      '">Size chart</a></label>'
    : "";
  var icon = {
    shield:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg>',
    truck:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h12a4 4 0 010 8H8"/><path d="M8 4L4 8l4 4"/></svg>',
  };
  var wa =
    "https://wa.me/" +
    cfg.whatsapp +
    "?text=" +
    encodeURIComponent("Hello, I would like to ask about the " + p.name);

  root.innerHTML =
    '<div class="pdp-g"><div class="zoom" id="zoom">' +
    AJ.picture(p.img, p.alt, 1600, 1600, false) +
    "</div></div>" +
    '<div class="pdp-i">' +
    '<nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a><a href="' +
    cat.page +
    '">' +
    cat.name +
    "</a><span>" +
    AJ.esc(p.name) +
    "</span></nav>" +
    "<h1>" +
    AJ.esc(p.name) +
    '</h1><p class="pp">' +
    AJ.money(p.price) +
    '</p><p class="pd">' +
    AJ.esc(desc) +
    "</p>" +
    '<dl class="specs"><div><dt>Metal and stones</dt><dd>' +
    AJ.esc(p.spec) +
    "</dd></div><div><dt>Weight</dt><dd>" +
    p.weight +
    "</dd></div><div><dt>Making charges</dt><dd>Included in the price</dd></div><div><dt>Certificate</dt><dd>Hallmark and purity certificate</dd></div></dl>" +
    '<div class="buy">' +
    sizeHtml +
    '<div class="qty"><button type="button" data-q="-1" aria-label="One less">-</button><input id="pq" value="1" inputmode="numeric" aria-label="Quantity"><button type="button" data-q="1" aria-label="One more">+</button></div></div>' +
    '<div class="buy2"><button class="btn" type="button" id="padd">Add to bag</button><button class="btn btn-ghost" type="button" id="pbuy">Buy now</button></div>' +
    '<a class="wa" href="' +
    wa +
    '" target="_blank" rel="noopener">Ask about this piece on WhatsApp</a>' +
    '<ul class="trust"><li>' +
    icon.shield +
    "<span>Certified purity</span></li><li>" +
    icon.truck +
    "<span>Free insured delivery</span></li><li>" +
    icon.back +
    "<span>7 day returns</span></li></ul>" +
    "<details open><summary>About this piece</summary><p>Made in our workshop and finished by hand. Size, stones and karat can be changed on request, so message us if you want a variation.</p></details>" +
    "<details><summary>Purity and pricing</summary><p>The price follows today's gold rate plus the value of any stones. You get a line by line breakdown and a purity certificate with the piece.</p></details>" +
    "<details><summary>Delivery and returns</summary><p>Insured, tracked delivery across Pakistan in 2 to 5 working days. Unworn pieces can be returned within 7 days.</p></details>" +
    "</div>";

  /* buying */
  var qty = $("#pq");
  AJ.$$(".qty [data-q]", root).forEach(function (b) {
    b.addEventListener("click", function () {
      qty.value = Math.max(
        1,
        (parseInt(qty.value, 10) || 1) + parseInt(b.getAttribute("data-q"), 10),
      );
    });
  });
  function size() {
    var s = $("#psize");
    return s ? s.value : "";
  }
  $("#padd").addEventListener("click", function () {
    AJ.cart.add(p.id, qty.value, size());
    AJ.show("bag");
  });
  $("#pbuy").addEventListener("click", function () {
    AJ.cart.add(p.id, qty.value, size());
    location.href = "checkout.html";
  });

  /* zoom on hover (desktop) */
  var z = $("#zoom");
  z.addEventListener("mousemove", function (e) {
    var r = z.getBoundingClientRect();
    z.style.setProperty("--zx", ((e.clientX - r.left) / r.width) * 100 + "%");
    z.style.setProperty("--zy", ((e.clientY - r.top) / r.height) * 100 + "%");
    z.classList.add("on");
  });
  z.addEventListener("mouseleave", function () {
    z.classList.remove("on");
  });

  /* more from the same collection */
  var more = AJ.products
    .filter(function (x) {
      return x.cat === p.cat && x.id !== p.id;
    })
    .slice(0, 4);
  $("#relgrid").innerHTML = more
    .map(function (x) {
      return AJ.card(x, false);
    })
    .join("");
  AJ.reveal($("#related"));
})();
