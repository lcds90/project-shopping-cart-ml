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
  section.appendChild(createCustomElement('span', 'item__price', `$ ${salePrice}`));
  section.appendChild(
    createCustomElement('button', 'item__add', 'Adicionar ao carrinho'),
  );
  return section;
}

function changePrice(price, operation) {
  const getValuesLine = localStorage.getItem('items') ? localStorage.getItem('items').split(',') : '';
  
  if (getValuesLine) {
    let values = getValuesLine.map((value) => value.split('|')[1]);
    values = values.filter((value) => value !== undefined);
    let total = values.reduce((acc, curr) => {
      acc += curr; 
      return acc;
    });

    if (operation === 'plus') total += price;
    if (operation === 'minus') total -= price;
    localStorage.setItem('value', total);
    document.querySelector('.total-price').innerHTML = total;
  }
}

async function cartItemClickListener(event, price) {
  event.preventDefault();
  event.currentTarget.remove();
  changePrice(price, 'minus');

  localStorage.setItem('itemsHTML', cart.innerHTML);
}

async function createCartItemElement({
  id: sku,
  title: name,
  price: salePrice,
}) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerHTML = `<span class="cart__id">SKU: ${sku}</span><span class="cart__name"> | NAME: ${name}</span><span class="cart__price"> | PRICE: $${salePrice}</span>`;
  li.addEventListener('click', (e) => cartItemClickListener(e, salePrice));
  changePrice(salePrice, 'plus');
  return li;
}

const makeRequestAllProducts = async (query = 'computador') => {
  const loading = document.createElement('section');
  const div = document.querySelector('.container');
  loading.className = 'loading';
  div.appendChild(loading);
  return fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${query}`)
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
      const productItem = await createCartItemElement(product);
      await changePrice(product.price, 'plus');
      cart.appendChild(productItem);
      let itens = localStorage.getItem('items') ? localStorage.getItem('items') : '';
      itens += `${product.id}|${product.price},`;
      localStorage.setItem('items', itens);
      localStorage.setItem('itemsHTML', cart.innerHTML);
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
    const section = await createProductItemElement(product);
    section.setAttribute('data-id', product.id);
    section.setAttribute('data-price', product.price);
    await div.appendChild(section);
  });
};

const getValueAndGoToTotal = async (div) => {
  const getValuesLine = localStorage.getItem('items').split(',');
  let values = getValuesLine.map((value) => value.split('|')[1]);
  values = values.filter((value) => value !== undefined);
  if (getValuesLine) {
    await values.map((value) => changePrice(value, 'plus'));
  }
};

const getItemsList = async () => {
  const products = await localStorage.getItem('itemsHTML');
  if (products) {
    cart.innerHTML = products;
    const divs = await cart.children;
    Object.values(divs).forEach(async (div) => {
      await getValueAndGoToTotal();
      div.addEventListener('click', cartItemClickListener);
    });
  }
};

const eraseCart = async () => {
  const btn = document.querySelector('.empty-cart');
  btn.addEventListener('click', () => {
    cart.innerHTML = '';
    localStorage.removeItem('items');
    localStorage.removeItem('itemsHTML');
    localStorage.removeItem('value');
  });
};

window.onload = async () => {
  await getItemsList();
  await eraseCart();
  await makeRequestAndGetProducts();
  await activeGetProductsToCart();
};
