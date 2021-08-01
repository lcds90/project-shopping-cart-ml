const cart = document.querySelector('.cart__items');
const priceCard = document.querySelector('.total-price');
const searchInput = document.querySelector('#search');
// SECTION Requisito 1
async function makeRequestAllProducts(query) {
  const loading = document.createElement('section');
  const div = document.querySelector('.items');
  // NOTE Requisito 7
  loading.className = 'loading';
  loading.innerText = 'Carregando...';
  div.appendChild(loading);
  const response = await fetch(
    `https://api.mercadolibre.com/sites/MLB/search?q=${query}`,
  );
  const products = await response.json();
  loading.remove();
  return products.results;
}
// !SECTION

async function makeRequestProductById(id) {
  const loading = document.createElement('section');
  const div = document.querySelector('.cart');
  loading.className = 'loading';
  loading.innerText = 'Carregando...';
  div.appendChild(loading);
  const response = await fetch(`https://api.mercadolibre.com/items/${id}`);
  const product = await response.json();
  loading.remove();
  return product;
}

async function getItemsIdsAndReturnArray() {
  const getValuesLine = (await JSON.parse(localStorage.getItem('items'))) || [];
  return getValuesLine;
}

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

async function createProductItemElement({
  id: sku,
  title: name,
  thumbnail: image,
  price: salePrice,
}) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(
    createCustomElement('span', 'item__price', `$ ${salePrice}`),
  );
  section.appendChild(
    createCustomElement('button', 'item__add', 'Adicionar ao carrinho'),
  );
  return section;
}

async function changePriceAfterUpdateLocalStorage() {
  const productsIds = await getItemsIdsAndReturnArray();
  let result = 0;
  const qtd = productsIds.length;
  if (productsIds) {
    result += await productsIds.reduce(async (total, id) => {
      const product = await makeRequestProductById(id);
      const count = (await total) + product.price;
      return count;
    }, 0);
  }

  if (Number.isNaN(result)) result = 0;
  document.querySelector('.total-qtd').innerHTML = qtd;
  return result;
}

async function cartItemClickListener(event, id) {
  event.preventDefault();
  event.currentTarget.remove();
  let productsId = await getItemsIdsAndReturnArray();
  productsId = productsId.filter((pid) => pid !== id); // NOTE Excluindo item.
  localStorage.setItem('items', JSON.stringify(productsId));
  const price = await changePriceAfterUpdateLocalStorage();
  priceCard.innerHTML = price;
}

async function createCartItemElement({
  id: sku,
  title: name,
  price: salePrice,
  thumbnail: image,
}) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  li.className = 'cart__item';
  li.innerHTML = `<span class="cart__id">SKU: ${sku}</span>`;
  li.innerHTML += `<span class="cart__name"> | NAME: ${name}</span>`;
  li.innerHTML += `<span class="cart__price"> | PRICE: $${salePrice}</span>`;
  span.style.backgroundImage = `url('${image}')`;
  span.className = 'cart__image';
  li.addEventListener('click', (e) => cartItemClickListener(e, sku));
  li.appendChild(span);
  return li;
}

async function addProductToCart(id) {
  const product = await makeRequestProductById(id);
  const productItem = await createCartItemElement(product);

  cart.appendChild(productItem);
  const itens = JSON.parse(localStorage.getItem('items')) || [];
  itens.push(product.id);
  localStorage.setItem('items', JSON.stringify(itens));
  const price = await changePriceAfterUpdateLocalStorage();
  priceCard.innerHTML = price;
}

function activeGetProductsToCart() {
  const btns = document.querySelectorAll('.item__add');
  btns.forEach((btn) => {
    const id = btn.parentElement.getAttribute('data-id');
    btn.addEventListener('click', () => addProductToCart(id));
  });
}

async function makeRequestAndGetProducts(query = 'computador') {
  const div = document.querySelector('.items');
  const products = await makeRequestAllProducts(query);
  let index = 0;
  products.forEach(async (product) => {
    const section = await createProductItemElement(product);
    // NOTE Ao inves de armazernar uma id dentro, utilize o conceito de 'key' do React
    section.setAttribute('data-id', product.id);
    section.style.animation = `flipInY 2.5s ease ${index * 0.075}s`;
    setTimeout(() => { section.style.opacity = 1; }, (index * 0.175) + 1250);
    index += 1;
  await div.appendChild(section);
  });
  const price = await changePriceAfterUpdateLocalStorage();
  priceCard.innerHTML = price;
}

async function generateListProducts() {
  const productsIds = await getItemsIdsAndReturnArray();
  if (productsIds) {
    await productsIds.forEach(async (id) => {
      const product = await makeRequestProductById(id);
      const section = await createCartItemElement(product);
      cart.appendChild(section);
    });
  }
  return undefined;
}

async function getItemsList() {
  const products = await generateListProducts();
  if (products) {
    cart.innerHTML = products;
    const divs = await cart.children;
    Object.values(divs).forEach(async (div) => {
      await div.addEventListener('click', cartItemClickListener);
    });
  }
}

function eraseCart() {
  const btn = document.querySelector('.empty-cart');
  btn.addEventListener('click', async () => {
    // NOTE Animação
    await Object.values(cart.children).forEach(async (item) => {
      item.classList.add('cart-fade');
    });
    setTimeout(() => {
      cart.innerHTML = '';
      priceCard.innerHTML = 0;
      document.querySelector('.total-qtd').innerHTML = 0;
      localStorage.setItem('items', JSON.stringify([]));
    }, 2000);
  });
}

window.onload = async () => {
  await getItemsList();
  await eraseCart();
  await makeRequestAndGetProducts();
  await activeGetProductsToCart();
  await searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const items = document.querySelector('.items');
      items.innerHTML = '';
      await makeRequestAndGetProducts(searchInput.value);
      await activeGetProductsToCart();
      if (items.children.length === 0) {
        items.innerHTML = '<div class="no-results">Sem resultados para exibir</div>';
      }
    }
  });
};