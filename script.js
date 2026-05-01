const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".card");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      cards.forEach(card => {
        const category = card.dataset.category;

        if (filter === "all" || category === filter) {
          card.classList.remove("hide");
        } else {
          card.classList.add("hide");
        }
      });
    });
  });

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

  let currentProduct = null;

  function createArt(type) {
    if (type === "keyboard") {
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

    if (type === "mouse") {
      return `<div class="mouse"></div>`;
    }

    return `
      <div class="accessory">
        <div class="pad"></div>
        <div class="cable"></div>
      </div>
    `;
  }

  function parsePrice(priceText) {
    const number = priceText.replace("$", "").replace("от", "").trim();
    return Number(number) || 0;
  }

  function openModal(card) {
    const title = card.dataset.title;
    const desc = card.dataset.desc;
    const price = card.dataset.price;
    const oldPrice = card.dataset.old;
    const type = card.dataset.type;
    const specs = card.dataset.specs.split("|");
    const link = card.dataset.link;

    currentProduct = {
      id: title,
      title: title,
      priceText: price,
      priceNumber: parsePrice(price),
      link: link
    };

    modalArt.innerHTML = createArt(type);
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalPrice.textContent = price;
    modalOldPrice.textContent = oldPrice || "";
    modalOrder.href = link;

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
        if (currentProduct) {
          addToCart(currentProduct);
        }
      });
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  cards.forEach(card => {
    card.addEventListener("click", () => openModal(card));
  });

  modalClose.addEventListener("click", closeModal);
  modalCloseSecond.addEventListener("click", closeModal);

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", event => {
if (event.key === "Escape") {
  closeModal();
  closeCart();
  closeFav();
}
  });

  const cartOpen = document.getElementById("cartOpen");
  const cartClose = document.getElementById("cartClose");
  const cartPanel = document.getElementById("cartPanel");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const cartOrder = document.getElementById("cartOrder");
  const addedToast = document.getElementById("addedToast");

  let cart = JSON.parse(localStorage.getItem("inputxCart")) || [];

  function getProductFromCard(card) {
    return {
      id: card.dataset.title,
      title: card.dataset.title,
      priceText: card.dataset.price,
      priceNumber: parsePrice(card.dataset.price),
      link: card.dataset.link
    };
  }

  function getProductById(id) {
    const card = Array.from(cards).find(item => item.dataset.title === id);
    return card ? getProductFromCard(card) : null;
  }

  let savedFavorites = JSON.parse(localStorage.getItem("inputxFavorites")) || [];
  let favorites = Array.isArray(savedFavorites)
    ? savedFavorites
        .map(item => typeof item === "string" ? getProductById(item) : item)
        .filter(Boolean)
    : [];
 const favOpen = document.getElementById("favOpen");
const favClose = document.getElementById("favClose");
const favPanel = document.getElementById("favPanel");
const favItems = document.getElementById("favItems");
const favCount = document.getElementById("favCount");

function openFav() {
  favPanel.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeFav() {
  favPanel.classList.remove("active");
  document.body.style.overflow = "";
}

favOpen.addEventListener("click", openFav);
favClose.addEventListener("click", closeFav);

favPanel.addEventListener("click", (e) => {
  if (e.target === favPanel) closeFav();
});
  function openCart() {
    cartPanel.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartPanel.classList.remove("active");
    document.body.style.overflow = "";
  }

  function showToast() {
    addedToast.classList.add("active");

    setTimeout(() => {
      addedToast.classList.remove("active");
    }, 1600);
  }

  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        ...product,
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
  function saveFavorites() {
  localStorage.setItem("inputxFavorites", JSON.stringify(favorites));
}

function updateFavoriteButtons() {
  cards.forEach(card => {
    const title = card.dataset.title;
    const button = card.querySelector(".favorite-btn");

    if (!button) return;

    const exists = favorites.find(item => item.id === title);

    if (exists) {
      button.classList.add("active");
      button.textContent = "♥";
    } else {
      button.classList.remove("active");
      button.textContent = "♡";
    }
  });
}

function renderFavorites() {
  favItems.innerHTML = "";

  if (favorites.length === 0) {
    favItems.innerHTML = `<div class="cart-empty">Нет избранных товаров</div>`;
  } else {
    favorites.forEach(item => {
      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <div class="cart-item-top">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${item.priceText}</div>
        </div>

        <div class="cart-controls">
          <button class="btn-second" type="button" data-action="fav-addcart" data-id="${item.id}">
            В корзину
          </button>

          <a href="${item.link}" target="_blank" class="btn-second">
            Заказать
          </a>

          <button class="remove-item" type="button" data-action="remove-fav" data-id="${item.id}">
            Убрать
          </button>
        </div>
      `;

      favItems.appendChild(div);
    });
  }

  favCount.textContent = favorites.length;
}

document.querySelectorAll(".favorite-btn").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();

    const card = button.closest(".card");
    const product = getProductFromCard(card);
    const exists = favorites.find(item => item.id === product.id);

    if (exists) {
      favorites = favorites.filter(item => item.id !== product.id);
    } else {
      favorites.push(product);
    }

    saveFavorites();
    updateFavoriteButtons();
    renderFavorites();
  });
});

favItems.addEventListener("click", event => {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;

  if (!action || !id) return;

  if (action === "remove-fav") {
    favorites = favorites.filter(item => item.id !== id);
    saveFavorites();
    updateFavoriteButtons();
    renderFavorites();
  }

  if (action === "fav-addcart") {
    const product = getProductById(id);
    if (product) addToCart(product);
  }
});

saveFavorites();
updateFavoriteButtons();
renderFavorites();
  function renderCart() {
    localStorage.setItem("inputxCart", JSON.stringify(cart));
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
            <div class="cart-item-price">${item.priceText}</div>
          </div>

          <div class="cart-controls">
            <div class="qty">
              <button type="button" data-action="minus" data-id="${item.id}">−</button>
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

    const lines = cart.map(item => {
      return `— ${item.title}: ${item.qty} шт. (${item.priceText})`;
    });

    const totalPrice = cart.reduce((sum, item) => sum + item.priceNumber * item.qty, 0);

    const message =
      `Привет! Хочу оформить заказ в InputX:\n\n` +
      lines.join("\n") +
      `\n\nИтого: $${totalPrice}\n` +
      `Подскажите, есть ли всё в наличии?`;

    cartOrder.href = `https://t.me/inputXstore?text=${encodeURIComponent(message)}`;
  }

  cartOpen.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);

  cartPanel.addEventListener("click", event => {
    if (event.target === cartPanel) {
      closeCart();
    }
  });

  cartItems.addEventListener("click", event => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;

    if (!action || !id) return;

    if (action === "plus") {
      changeQty(id, 1);
    }

    if (action === "minus") {
      changeQty(id, -1);
    }

    if (action === "remove") {
      removeFromCart(id);
    }
  });

  renderCart(); 
  renderFavorites();


