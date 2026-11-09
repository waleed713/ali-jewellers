/* checkout.js : delivery details, payment method and placing the order.
   There is no payment gateway or server yet. Placing an order shows a confirmation and
   prepares a WhatsApp message for the shop. Wire it to a real backend before going live. */
(function () {
  "use strict";
  var AJ = window.AJ,
    $ = AJ.$,
    form = $("#coform"),
    sum = $("#sum"),
    done = $("#done");
  var methods = {
    cod: "Cash on delivery",
    jazzcash: "JazzCash",
    easypaisa: "Easypaisa",
    bank: "Bank transfer",
    card: "Card (payment link)",
  };
  var needsRef = ["jazzcash", "easypaisa", "bank"];

  function renderSummary() {
    var items = AJ.cart.items(),
      t = AJ.money(AJ.cart.total());
    sum.innerHTML =
      "<h2>Order summary</h2>" +
      (items.length
        ? items
            .map(function (i) {
              var n = AJ.info(i);
              return n
                ? '<div class="mi"><img src="' +
                    n.img +
                    '" alt="" width="54" height="54"><span>' +
                    AJ.esc(n.name) +
                    " x " +
                    i.q +
                    "</span><b>" +
                    AJ.money(n.price * i.q) +
                    "</b></div>"
                : "";
            })
            .join("")
        : "<p>Your bag is empty.</p>") +
      '<div class="r"><span>Subtotal</span><span>' +
      t +
      '</span></div><div class="r"><span>Insured delivery</span><span>Free</span></div><div class="r t"><span>Total</span><strong>' +
      t +
      "</strong></div>";
  }
  AJ.cart.onChange(function () {
    if (!form.hidden) renderSummary();
  });
  renderSummary();

  form.addEventListener("change", function (e) {
    if (e.target.name === "pay")
      $("#txw").hidden = needsRef.indexOf(e.target.value) < 0;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var note = $("#conote"),
      d = new FormData(form),
      pay = d.get("pay"),
      items = AJ.cart.items();
    if (!items.length) {
      note.textContent = "Your bag is empty.";
      return;
    }
    if (!d.get("name") || !d.get("phone") || !d.get("addr")) {
      note.textContent = "Please fill in your name, phone number and address.";
      return;
    }
    if (needsRef.indexOf(pay) > -1 && !d.get("tx")) {
      note.textContent =
        "Please enter the transaction ID after sending your payment.";
      return;
    }

    var num =
      "AJ" +
      new Date().toISOString().slice(2, 10).replace(/-/g, "") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);
    var total = AJ.money(AJ.cart.total());
    var lines = items
      .map(function (i) {
        var n = AJ.info(i);
        return (
          "- " +
          n.name +
          " (" +
          n.sub +
          ") x " +
          i.q +
          ": " +
          AJ.money(n.price * i.q)
        );
      })
      .join("\n");
    var msg =
      "Order " +
      num +
      "\n" +
      lines +
      "\nTotal: " +
      total +
      "\nPayment: " +
      methods[pay] +
      (d.get("tx") ? " (ref " + d.get("tx") + ")" : "") +
      "\nName: " +
      d.get("name") +
      "\nPhone: " +
      d.get("phone") +
      "\nAddress: " +
      d.get("addr") +
      ", " +
      d.get("city");

    AJ.cart.clear();
    $("#onum").textContent = num;
    $("#odet").textContent =
      "Total " +
      total +
      " by " +
      methods[pay] +
      ". We will call you on " +
      d.get("phone") +
      " to confirm.";
    $("#owa").href =
      "https://wa.me/" +
      AJ.config.whatsapp +
      "?text=" +
      encodeURIComponent(msg);
    form.hidden = true;
    sum.hidden = true;
    done.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
