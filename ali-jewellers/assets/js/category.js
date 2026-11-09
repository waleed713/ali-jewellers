/* category.js : fills the product grid on gold, diamond, men's and bridal pages.
   The page says which category it is with data-cat on #grid. */
(function () {
  "use strict";
  var AJ = window.AJ,
    grid = AJ.$("#grid");
  if (!grid) return;
  var cat = grid.getAttribute("data-cat");
  grid.innerHTML = AJ.products
    .filter(function (p) {
      return p.cat === cat;
    })
    .map(function (p) {
      return AJ.card(p, true);
    })
    .join("");
  AJ.reveal(grid);
})();
