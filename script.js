document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = Array.from(document.querySelectorAll(".card"));
  const catalogSearch = document.getElementById("catalogSearch");
  const searchEmpty = document.getElementById("searchEmpty");

  const modal = document.getElementById("productModal");
  const modalClose = document.getElementById("modalClose");
  const modalCloseSecond = document.getElementById("modalCloseSecond");
  const modalArt = document.getElementById("modalArt");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalSpecs = document.getElementById("modalSpecs");
  const modalPrice = document.getElementById("modalPrice");
  const modalOldPrice = document.getElementById("modalOldPrice");
  const modalOrder = document.getElementById("modalOrder");

  const cartOpen = document.getElementById("cartOpen");
  const cartClose = document.getElementById("cartClose");
  const cartPanel = document.getElementById("cartPanel");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const cartOrder = document.getElementById("cartOrder");
  const addedToast = document.getElementById("addedToast");

  const favOpen = document.getElementById("favOpen");
  const favClose = document.getElementById("favClose");
  const favPanel = document.getElementById("favPanel");
  const favItems = document.getElementById("favItems");
  const favCount = document.getElementById("favCount");

  let activeFilter = "all";
  let searchQuery = "";
  let currentProduct = null;
  let toastTimer = null;

  const products = cards.map(card => getProductFromCard(card));
  let cart = readStorage("inputxCart", []).map(normalizeCartItem).filter(Boolean);
  let favorites = readStorage("inputxFavorites", []).map(normalizeFavoriteItem).filter(Boolean);

  function readStorage(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : fallback;
    } catch {
      return fallback;
    }
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9а-яё-]/gi, "");
  }

  function parsePrice(price) {
    const number = String(price || "")
      .replace("$", "")
      .replace("от", "")
      .trim();
    return Number(number) || 0;
  }

  function getProductId(card) {
    return card.dataset.id || slugify(card.dataset.title);
  }

  function getProductFromCard(card) {
    const title = card.dataset.title || "";
    const price = card.dataset.price || "";

    return {
      id: getProductId(card),
      title,
      price,
      priceNumber: parsePrice(price),
      link: card.dataset.link || "https://t.me/inputXstore",
      image: card.dataset.image || "",
      desc: card.dataset.desc || "",
      specs: card.dataset.specs || "",
      type: card.dataset.type || "accessory"
    };
  }

  function getProductById(id) {
    return products.find(product => product.id === id) || null;
  }

  function normalizeFavoriteItem(item) {
    if (typeof item === "string") {
      return getProductById(slugify(item)) || products.find(product => product.title === item) || null;
    }

    if (!item || typeof item !== "object") return null;

    const title = item.title || "";
    const product = getProductById(item.id) || products.find(cardProduct => cardProduct.title === title);

    return {
      id: product?.id || item.id || slugify(title),
      title: product?.title || title,
      price: product?.price || item.price || item.priceText || "",
      link: product?.link || item.link || "https://t.me/inputXstore",
      image: product?.image || item.image || ""
    };
  }

  function normalizeCartItem(item) {
    if (!item || typeof item !== "object") return null;

    const product = getProductById(item.id) || products.find(cardProduct => cardProduct.title === item.title);
    const price = product?.price || item.price || item.priceText || "";

    return {
      id: product?.id || item.id || slugify(item.title),
      title: product?.title || item.title || "",
      price,
      priceNumber: product?.priceNumber ?? item.priceNumber ?? parsePrice(price),
      link: product?.link || item.link || "https://t.me/inputXstore",
      image: product?.image || item.image || "",
      qty: Math.max(1, Number(item.qty) || 1)
    };
  }

  function saveCart() {
    localStorage.setItem("inputxCart", JSON.stringify(cart));
  }

  function saveFavorites() {
    localStorage.setItem("inputxFavorites", JSON.stringify(favorites));
  }

  function createArt(product) {
    if (product.image) {
      return `<img class="product-photo" src="${product.image}" alt="">`;
    }

    if (product.type === "keyboard") {
      return `
        <div class="keyboard">
          <div class="key"></div><div class="key"></div><div class="key glow"></div><div class="key"></div><div class="key"></div>
          <div class="key"></div><div class="key"></div><div class="key glow"></div><div class="key"></div><div class="key"></div>
          <div class="key"></div><div class="key glow"></div><div class="key"></div><div class="key"></div><div class="key"></div>
          <div class="key"></div><div class="key"></div><div class="key"></div><div class="key glow"></div><div class="key"></div>
          <div class="key"></div><div class="key"></div><div class="key"></div><div class="key glow"></div><div class="key"></div>
          <div class="key"></div><div class="key"></div><div class="key"></div><div class="key"></div><div class="key"></div>
        </div>
      `;
    }

    if (product.type === "mouse") {
      return `<div class="mouse"></div>`;
    }

    return `
      <div class="accessory">
        <div class="pad"></div>
        <div class="cable"></div>
      </div>
    `;
  }

  function applyCatalogFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      const product = getProductFromCard(card);
      const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
      const matchesSearch = !searchQuery || product.title.toLowerCase().includes(searchQuery);
      const isVisible = matchesCategory && matchesSearch;

      card.classList.toggle("hide", !isVisible);
      if (isVisible) visibleCount += 1;
    });

    if (searchEmpty) {
      searchEmpty.classList.toggle("active", visibleCount === 0);
    }
  }

  function openModal(card) {
    const product = getProductFromCard(card);
    const specs = product.specs ? product.specs.split("|") : [];

    currentProduct = product;

    modalArt.innerHTML = createArt(product);
    modalTitle.textContent = product.title;
    modalDesc.textContent = product.desc;
    modalPrice.textContent = product.price;
    modalOldPrice.textContent = card.dataset.old || "";
    modalOrder.href = product.link;

    modalSpecs.innerHTML = "";
    specs.forEach(spec => {
      const item = document.createElement("div");
      item.textContent = spec;
      modalSpecs.appendChild(item);
    });

    let addButton = document.getElementById("modalAddCart");
    if (!addButton) {
      addButton = document.createElement("button");
      addButton.className = "btn-second";
      addButton.id = "modalAddCart";
      addButton.textContent = "Добавить в корзину";

      const actions = document.querySelector(".modal-actions");
      actions.insertBefore(addButton, actions.children[1]);

      addButton.addEventListener("click", () => {
        if (currentProduct) addToCart(currentProduct);
      });
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  function openCart() {
    cartPanel.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartPanel.classList.remove("active");
    document.body.style.overflow = "";
  }

  function openFav() {
    favPanel.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeFav() {
    favPanel.classList.remove("active");
    document.body.style.overflow = "";
  }

  function showToast() {
    if (!addedToast) return;

    addedToast.classList.add("active");
    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      addedToast.classList.remove("active");
    }, 1600);
  }

  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        priceNumber: product.priceNumber,
        link: product.link,
        image: product.image,
        qty: 1
      });
    }

    renderCart();
    showToast();
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
  }

  function changeQty(id, direction) {
    const item = cart.find(product => product.id === id);
    if (!item) return;

    item.qty += direction;

    if (item.qty <= 0) {
      removeFromCart(id);
      return;
    }

    renderCart();
  }

  function toggleFavorite(product) {
    const exists = favorites.some(item => item.id === product.id);

    if (exists) {
      favorites = favorites.filter(item => item.id !== product.id);
    } else {
      favorites.push({
        id: product.id,
        title: product.title,
        price: product.price,
        link: product.link,
        image: product.image
      });
    }

    saveFavorites();
    updateFavoriteButtons();
    renderFavorites();
  }

  function updateFavoriteButtons() {
    cards.forEach(card => {
      const product = getProductFromCard(card);
      const button = card.querySelector(".favorite-btn");
      if (!button) return;

      const isActive = favorites.some(item => item.id === product.id);
      button.classList.toggle("active", isActive);
      button.textContent = isActive ? "♥" : "♡";
    });

    favCount.textContent = favorites.length;
  }

  function renderFavorites() {
    favItems.innerHTML = "";

    if (favorites.length === 0) {
      favItems.innerHTML = `<div class="cart-empty">Нет избранных товаров</div>`;
      updateFavoriteButtons();
      return;
    }

    favorites.forEach(item => {
      const favoriteItem = document.createElement("div");
      favoriteItem.className = "cart-item";

      const wrapper = document.createElement("div");
      wrapper.className = "fav-item";

      if (item.image) {
        const image = document.createElement("img");
        image.className = "fav-thumb";
        image.src = item.image;
        image.alt = item.title;
        wrapper.appendChild(image);
      }

      const content = document.createElement("div");
      content.className = "fav-content";

      const top = document.createElement("div");
      top.className = "cart-item-top";

      const title = document.createElement("div");
      title.className = "cart-item-title";
      title.textContent = item.title;

      const price = document.createElement("div");
      price.className = "cart-item-price";
      price.textContent = item.price;

      top.append(title, price);

      const controls = document.createElement("div");
      controls.className = "cart-controls";

      const order = document.createElement("a");
      order.className = "btn-second";
      order.href = item.link;
      order.target = "_blank";
      order.rel = "noopener";
      order.textContent = "Заказать";

      const remove = document.createElement("button");
      remove.className = "remove-item";
      remove.type = "button";
      remove.dataset.action = "remove-fav";
      remove.dataset.id = item.id;
      remove.textContent = "Удалить";

      controls.append(order, remove);
      content.append(top, controls);
      wrapper.appendChild(content);
      favoriteItem.appendChild(wrapper);
      favItems.appendChild(favoriteItem);
    });

    updateFavoriteButtons();
  }

  function renderCart() {
    saveCart();
    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = `<div class="cart-empty">Корзина пустая. Добавь товар из карточки.</div>`;
    } else {
      cart.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
          <div class="cart-item-top">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">${item.price}</div>
          </div>

          <div class="cart-controls">
            <div class="qty">
              <button type="button" data-action="minus" data-id="${item.id}">-</button>
              <span>${item.qty}</span>
              <button type="button" data-action="plus" data-id="${item.id}">+</button>
            </div>

            <button class="remove-item" type="button" data-action="remove" data-id="${item.id}">
              Убрать
            </button>
          </div>
        `;

        cartItems.appendChild(cartItem);
      });
    }

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.priceNumber * item.qty, 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${totalPrice}`;
    updateTelegramLink();
  }

  function updateTelegramLink() {
    if (cart.length === 0) {
      cartOrder.href = "https://t.me/inputXstore";
      return;
    }

    const lines = cart.map(item => `${item.title}: ${item.qty} шт. (${item.price})`);
    const totalPrice = cart.reduce((sum, item) => sum + item.priceNumber * item.qty, 0);
    const message =
      `Привет! Хочу оформить заказ в InputX:\n\n` +
      lines.join("\n") +
      `\n\nИтого: $${totalPrice}\n` +
      `Подскажите, есть ли всё в наличии?`;

    cartOrder.href = `https://t.me/inputXstore?text=${encodeURIComponent(message)}`;
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach(filterButton => filterButton.classList.remove("active"));
      button.classList.add("active");
      applyCatalogFilters();
    });
  });

  if (catalogSearch) {
    catalogSearch.addEventListener("input", event => {
      searchQuery = event.target.value.trim().toLowerCase();
      applyCatalogFilters();
    });
  }

  cards.forEach(card => {
    const favoriteButton = card.querySelector(".favorite-btn");

    if (favoriteButton) {
      favoriteButton.addEventListener("click", event => {
        event.stopPropagation();
        toggleFavorite(getProductFromCard(card));
      });
    }

    card.addEventListener("click", () => openModal(card));
  });

  modalClose.addEventListener("click", closeModal);
  modalCloseSecond.addEventListener("click", closeModal);
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  cartOpen.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartPanel.addEventListener("click", event => {
    if (event.target === cartPanel) closeCart();
  });

  favOpen.addEventListener("click", openFav);
  favClose.addEventListener("click", closeFav);
  favPanel.addEventListener("click", event => {
    if (event.target === favPanel) closeFav();
  });

  cartItems.addEventListener("click", event => {
    const { action, id } = event.target.dataset;
    if (!action || !id) return;

    if (action === "plus") changeQty(id, 1);
    if (action === "minus") changeQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  favItems.addEventListener("click", event => {
    const { action, id } = event.target.dataset;
    if (action !== "remove-fav" || !id) return;

    favorites = favorites.filter(item => item.id !== id);
    saveFavorites();
    renderFavorites();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    closeModal();
    closeCart();
    closeFav();
  });

  saveFavorites();
  renderCart();
  renderFavorites();
  applyCatalogFilters();
});
