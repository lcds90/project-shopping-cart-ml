const cart = document.querySelector('.cart__items');
const priceCard = document.querySelector('.total-price');

// SECTION Requisito 1
async function makeRequestAllProducts(query = 'computador') {
  const loading = document.createElement('section');
  const div = document.querySelector('.container');
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
  const div = document.querySelector('.container');
  loading.className = 'loading';
  loading.innerText = 'Carregando...';
  div.appendChild(loading);
  const response = await fetch(`https://api.mercadolibre.com/items/${id}`);
  const product = await response.json();
  loading.remove();
  return product;
}

async function getItemsIdsAndReturnArray() {
  const getValuesLine = await localStorage.getItem('items')
    ? localStorage.getItem('items').split(',')
    : undefined;

  if (getValuesLine) {
    // NOTE Como a lista  de id é salva com virgulas, o ultimo retorna como undefined, então é necessário corta-lo
    
    // LINK Demonstrar debugger na pratica com erro, pois estava deixando somente essa validação e quando faltava so um item, ele o removia
    // getValuesLine.splice(getValuesLine.length - 1);
    return getValuesLine;
  }
  return undefined;
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
  if (productsIds) {
    result += await productsIds.reduce(async (total, id) => {
      const product = await makeRequestProductById(id);
      const count = await total + product.price;
      return count;
    }, 0);
  }
  return result;
}

async function cartItemClickListener(event, id) {
  event.preventDefault();
  event.currentTarget.remove();
  let productsId = await getItemsIdsAndReturnArray();

  // NOTE Realizando o padrão pois no final esta salvando uma string no final com ,
  productsId = productsId.filter((pid) => pid !== id).join(',');
  // NOTE Removendo em caso de não haver mais ids disponiveis e não ficar somente uma virgula no final, o que estava causando um bug.
  if (productsId.length === 1) localStorage.removeItem('items');
  localStorage.setItem('items', productsId);
  const price = await changePriceAfterUpdateLocalStorage();
  priceCard.innerHTML = price;
}

async function createCartItemElement({
  id: sku,
  title: name,
  price: salePrice,
}) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerHTML = `<span class="cart__id">SKU: ${sku}</span>`;
  li.innerHTML += `<span class="cart__name"> | NAME: ${name}</span>`;
  li.innerHTML += `<span class="cart__price"> | PRICE: $${salePrice}</span>`;
  li.addEventListener('click', (e) => cartItemClickListener(e, sku));
  return li;
}

async function addProductToCart(id) {
  const product = await makeRequestProductById(id);
  const productItem = await createCartItemElement(product);

  cart.appendChild(productItem);
  let itens = localStorage.getItem('items')
    ? localStorage.getItem('items')
    : '';
  itens += `${product.id},`;
  localStorage.setItem('items', itens);
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

async function makeRequestAndGetProducts() {
  const div = document.querySelector('.items');
  const products = await makeRequestAllProducts();

  products.forEach(async (product) => {
    const section = await createProductItemElement(product);
    // NOTE Ao inves de armazernar uma id dentro, utilize o conceito de 'key' do React
    section.setAttribute('data-id', product.id);
    await div.appendChild(section);
  });
  const price = await changePriceAfterUpdateLocalStorage();
  priceCard.innerHTML = price;
}

const generateListProducts = async () => {
  const productsIds = await getItemsIdsAndReturnArray();
  if (productsIds) {
    await productsIds.forEach(async (id) => {
      const product = await makeRequestProductById(id);
      const section = await createCartItemElement(product);
      cart.appendChild(section);
    });
  }
  return undefined;
};

const getItemsList = async () => {
  const products = await generateListProducts();
  if (products) {
    cart.innerHTML = products;
    const divs = await cart.children;
    Object.values(divs).forEach(async (div) => {
      div.addEventListener('click', cartItemClickListener);
    });
  }
};

const eraseCart = async () => {
  const btn = document.querySelector('.empty-cart');
  btn.addEventListener('click', () => {
    cart.innerHTML = '';
    priceCard.innerHTML = 0;
    localStorage.removeItem('items');
  });
};

window.onload = async () => {
  await getItemsList();
  await eraseCart();
  await makeRequestAndGetProducts();
  await activeGetProductsToCart();
};
