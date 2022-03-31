// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentBrand = "";
let favoriteProduct = [];

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNewProducts = document.querySelector('#nbNewProd');
const spanp50 = document.querySelector('#p50');
const spanp90 = document.querySelector('#p90');
const spanp95 = document.querySelector('#p95');
const spanLastReleased = document.querySelector('#last-released');
const selectSort = document.querySelector('#sort-select');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://server-thomasces.vercel.app/search?page=${page}&size=${size}`
    );
    const body = await response.json();
    if (body.succes !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Percentile calculator
 * @param {*} products 
 * @param {*} nb 
 */

function Percent(products,nb) {
  const temp =currentProducts.sort((x,y)=> x.price-y.price)
  const index=Math.round(temp.length*(nb/100))
  return products[index].price
};

/**
 * check fav
 * @param {*} id_prod
 */
function favProd(id_prod){
  const product=currentProducts.find(obj => {
    return obj._id === id_prod
  })
  const id= currentProducts.indexOf(product)
  console.log(product)
  currentProducts[id].favorite =!product.favorite
  if(currentProducts[id].favorite){
    favoriteProduct.push(currentProducts[id])
  }
  else{favoriteProduct=favoriteProduct.filter(obj => obj._id !== id_prod)  }
  render(currentProducts,currentPagination)
}

const renderProducts = products => {
  let test=document.getElementById("products");
  test.textContent='';

  let fragment = document.createDocumentFragment();
  products.forEach((product) =>{
    let div=document.createElement('div');
    div.classList.add("product");
    div.setAttribute("id",`${product._id}`);
    const template=`
      <img class="photo" src=${product.photo} style="display: block;">
      <span>Brand :</span>
      <strong>${product.brand}</strong>
      <span>Link :</span>
      <a href="${product.link}" target="_blank">${product.name}</a>
      <span>Price :</span>
      <strong>${product.price} €</strong>
      <input type="checkbox" onclick="favProd('${product._id}')"${product.favorite ? "checked" : ""}>
      <label for="favorite-product">Add to favorite</label>
    `;
    div.innerHTML=template;
    fragment.appendChild(div)
  })
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');
  
  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render brand selector
 * @param  {Object} brand
 */
 const renderBrands = products => {
  const brand=[];
  const options = products.map(obj => {
    if (!brand.includes(obj.brand)){
      brand.push(obj.brand);
      return `<option value="${obj.brand}" ${currentBrand===obj.brand ? "selected" : ""}>${obj.brand}</option>`
    }
  });
  
  options.unshift(`<option value="">All brands</option>`)

  selectBrand.innerHTML = options.join('')

  if(currentBrand===""){
    selectBrand.selectedIndex = 0
  }
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;

  spanNbNewProducts.innerHTML=currentProducts.filter(obj => (new Date()-new Date(obj.date)) < (24*60*60*1000*14)).length

  spanp50.innerHTML= Percent(currentProducts,50) + " €"
  spanp90.innerHTML= Percent(currentProducts,90) + " €"
  spanp95.innerHTML= Percent(currentProducts,95) + " €"

  const temp=currentProducts
  spanLastReleased.innerHTML=temp.sort((x,y)=> new Date(x.date)-new Date(y.date)).reverse()[0].date
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderBrands(products);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */


/**
 * Refresh function of the display
 */
function refresh(){
  fetchProducts(currentPagination.currentPage, currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => {
      updateFavProd()
    })
    .then(() => {
      if(currentBrand!==""){
        currentProducts=currentProducts.filter(obj => obj.brand === currentBrand)
      }
      render(currentProducts, currentPagination)
    });
  selectSort.value="no-filter"
};

/**
 * update the product list with fav to keep them while changing the page
 */
function updateFavProd(){
  const prods = currentProducts.map(obj => {
    const fav=favoriteProduct.find(favobj => favobj._id === obj._id)
    if(fav){obj.favorite=true}
    return obj
  })
  currentProducts=prods
}

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', event => {
  currentPagination.pageSize=parseInt(event.target.value);
  currentPagination.currentPage=1;
  refresh();
});

/**
 * Select the page to display
 * @type {[type]}
 */
 selectPage.addEventListener('change', event => {
  currentPagination.currentPage=parseInt(event.target.value);
  refresh()
});

/**
 * Select the brand of products to display
 * @type {[type]}
 */
 selectBrand.addEventListener('change', event => {
   currentBrand=event.target.value
   refresh()
});

/**
 * Sort the products to display
 * @type {[type]}
 */
 selectSort.addEventListener('change', event => {
  switch(event.target.value){
    default:
      break;
    case 'price-asc':
      currentProducts=currentProducts.sort((x,y)=> x.price-y.price)
      break;
    case 'price-desc':
      currentProducts=currentProducts.sort((x,y)=> x.price-y.price).reverse()
      break;
    case 'date-asc':
      currentProducts=currentProducts.sort((x,y)=> new Date(x.date)-new Date(y.date)).reverse()
      break;
    case 'date-desc':
      currentProducts=currentProducts.sort((x,y)=> new Date(x.date)-new Date(y.date))
      break;
    case 'no-filter':
      refresh()
      break;
  }
  renderProducts(currentProducts,currentPagination)
});


document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/**
 * Select the products released recently (less than 2 weeks)
 */
document.getElementById('recent_released').addEventListener('click', function () {
  currentProducts.forEach(obj => {
    obj.new=true
    if((new Date()-new Date(obj.date)) > (24*60*60*1000*14)){
      obj.new=false;
    }
  })
  currentProducts=currentProducts.filter(obj => obj.new === true)
  render(currentProducts, currentPagination);
});

/**
 * Select my fav products 
 */
 document.getElementById('fav_products').addEventListener('click', function () {
  currentProducts=currentProducts.filter(obj=>obj.favorite===true)
  render(currentProducts,currentPagination)
});

/**
 * Select the products that have reasonable price (less than 50€)
 */
 document.getElementById('reasonable_price').addEventListener('click', function () {
  currentProducts=currentProducts.filter(obj => obj.price < 50.0)
  render(currentProducts, currentPagination);
});