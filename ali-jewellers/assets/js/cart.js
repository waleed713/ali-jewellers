/* cart.js : the full bag page */
(function () {
  "use strict";
  var AJ = window.AJ,
    list = AJ.$("#cartlist"),
    sum = AJ.$("#sum");
  function render() {
    var items = AJ.cart.items();
    if (!items.length) {
      list.innerHTML =
        '<div class="empty"><p>Your bag is empty.</p><a class="btn" href="index.html#collections">See the collections</a></div>';
      sum.style.display = "none";
      return;
    }
    sum.style.display = "";
    list.innerHTML = items
      .map(function (i) {
        return AJ.lineHtml(i, true);
      })
      .join("");
    var t = AJ.money(AJ.cart.total());
    sum.innerHTML =
      '<h2>Order summary</h2><div class="r"><span>Subtotal</span><span>' +
      t +
      '</span></div><div class="r"><span>Insured delivery</span><span>Free</span></div>' +
      '<div class="r t"><span>Total</span><strong>' +
      t +
      '</strong></div><a class="btn" href="checkout.html">Proceed to checkout</a>';
  }
  AJ.cart.onChange(render);
  render();
})();
