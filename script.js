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

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  // coloque seu código aqui
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const makeRequest = async () => {
  return fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
    .then(response => response.json())
    .then((json) => {
      // console.log(json.results)
      return json.results;
    });
}

const makeRequestAndGetProducts = async () => {
    const div = document.querySelector('.items')
    const result = await makeRequest();
    for (const product of result) {
      console.log(product);
      const productObject = {
        sku: product.id,
        name: product.title,
        image: product.thumbnail
      }
      const section = await createProductItemElement(productObject);
      await div.appendChild(section);
    }
}

window.onload = async () => { 
  await makeRequestAndGetProducts();
};
