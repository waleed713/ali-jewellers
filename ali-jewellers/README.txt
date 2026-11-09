Ali Jewellers website
=====================

Open index.html to start. Everything uses relative paths, so the folder works from anywhere
(your computer, any hosting).

Pages
  index.html      home
  gold.html, diamond.html, mens.html, bridal.html    category pages
  product.html    ONE template for every product (product.html?p=product-slug)
  size-chart.html size and weight chart (pick category, type, karat, size, then order)
  cart.html, checkout.html

CSS (assets/css)
  base.css        colours, fonts, buttons (every page)
  layout.css      rates bar, header, footer, side panels, popup (every page)
  cards.css       the product card (home, category, product)
  home.css, category.css, product.css, size.css, cart.css, checkout.css    one per page type

JavaScript (assets/js)
  config.js       phone, WhatsApp, email, address
  rates.js        today's rates (edit daily). gold24Tola also drives the size chart price estimate
  products.js     ALL products. Add or edit a piece here and every page updates
  core.js         bag, menu, search, account, welcome popup
  reveal.js       scroll animations
  home.js, category.js, product.js, size.js, cart.js, checkout.js    one per page

To add a product: copy one block in products.js, give it a new slug, name, price and image
(put the image in assets/img as .jpg and .webp). It shows on its category page, in search and
gets its own product.html?p=slug page automatically. Add the slug to sitemap.xml too.

Before going live
  - Replace the placeholder phone, address, email and domain (config.js, the footer of each
    .html file, and www.alijewellers.pk in the <head> of each page and sitemap.xml).
  - Checkout has no payment gateway. Orders end as a WhatsApp message for the shop.
