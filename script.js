const cart = document.querySelector('.cart__items');
function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

async function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  return section;
}

async function changePrice(price, operation) {
  const div = document.querySelector('.total-price');
  let value = Number(div.innerHTML);
  if (operation === 'plus') value += price;
  if (operation === 'minus') value -= price;
  console.log(value);
  div.innerHTML = value;
}

function cartItemClickListener(event, price) {
  event.preventDefault();
  event.target.remove();
  changePrice(price, 'minus');
  localStorage.setItem('items', cart.innerHTML);
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', (e) => cartItemClickListener(e, salePrice));
  changePrice(salePrice, 'plus');
  return li;
}

const makeRequestAllProducts = async () => {
  const loading = document.createElement('section');
  const div = document.querySelector('.container');
  loading.className = 'loading';
  div.appendChild(loading);
  return fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
    .then((response) => response.json())
    .then((json) => {
      loading.remove();
      return json.results;
    });
};

const makeRequestProductById = async (id) => {
  const loading = document.createElement('section');
  const div = document.querySelector('.container');
  loading.className = 'loading';
  div.appendChild(loading);
  await fetch(`https://api.mercadolibre.com/items/${id}`)
    .then((response) => response.json())
    .then(async (product) => {
      loading.remove();
      const productObject = {
        sku: product.id,
        name: product.title,
        salePrice: product.price,
      };
      const productItem = await createCartItemElement(productObject);
      await changePrice(productObject.salePrice);
      cart.appendChild(productItem);
      localStorage.setItem('items', cart.innerHTML);
    });
};

const activeGetProductsToCart = () => {
  const btns = document.querySelectorAll('.item__add');
  btns.forEach((btn) => {
    const id = btn.parentElement.getAttribute('data-id');
    btn.addEventListener('click', () => makeRequestProductById(id));
  });
};

const makeRequestAndGetProducts = async () => {
  const div = document.querySelector('.items');
  const result = await makeRequestAllProducts();

  result.forEach(async (product) => {
    const productObject = {
      sku: product.id,
      name: product.title,
      image: product.thumbnail,
    };

    const section = await createProductItemElement(productObject);
    section.setAttribute('data-id', productObject.sku);
    await div.appendChild(section);
  });
};

const getItemsList = async () => {
  const products = await localStorage.getItem('items');
  if (products) {
    cart.innerHTML = products;
    const divs = await cart.children;
    Object.values(divs).forEach((div) =>
      div.addEventListener('click', cartItemClickListener));
  }
};

const eraseCart = async () => {
  const btn = document.querySelector('.empty-cart');
  btn.addEventListener('click', () => {
    cart.innerHTML = '';
    localStorage.removeItem('items');
  });
};

window.onload = async () => {
  await getItemsList();
  await eraseCart();
  await makeRequestAndGetProducts();
  await activeGetProductsToCart();
};
