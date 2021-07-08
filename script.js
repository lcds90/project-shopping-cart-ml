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
  console.log(event.target);
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const makeRequestAllProducts = async () => {
  return fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
    .then(response => response.json())
    .then((json) => {
      return json.results;
    });
}

const makeRequestProductById = async (id) => {
  const cart = document.querySelector('.cart__items')
  await fetch(`https://api.mercadolibre.com/items/${id}`)
    .then(response => response.json())
    .then((product) => {
      const productObject = {
        sku: product.id,
        name: product.title,
        salePrice: product.price
      }
      const productItem = createCartItemElement(productObject);
      cart.appendChild(productItem);
    });
}


const activeGetProductsToCart = () => {
  const btns = document.querySelectorAll('.item__add');
  btns.forEach((btn) => {
    const id = btn.parentElement.getAttribute('data-id');
    btn.addEventListener('click', () => makeRequestProductById(id))
  })
}

const makeRequestAndGetProducts = async () => {
    const div = document.querySelector('.items')
    const result = await makeRequestAllProducts();
    
    for (const product of result) {
      const productObject = {
        sku: product.id,
        name: product.title,
        image: product.thumbnail
      }
      
      const section = await createProductItemElement(productObject);
      section.setAttribute('data-id', productObject.sku);
      await div.appendChild(section);
    
    }
}

window.onload = async () => { 
  await makeRequestAndGetProducts();
  await activeGetProductsToCart();
};
