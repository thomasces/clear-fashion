const cors = require('cors');
const { parse } = require('dotenv');
const express = require('express');
const helmet = require('helmet');

const clientPromise = require('./mongodb-client');
const MONGODB_DB_NAME = 'clearfashionbythomas';
var collection;
var data;
var client;
var meta;
var total;

const PORT = 8092;
const app = express();
module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());
app.options('*', cors());

app.get('/', async (request, response) => {
  client=await clientPromise;
  data = client.db(MONGODB_DB_NAME);
  collection = data.collection('products');
  total = await collection.count({});
  meta = {"currentPage":1,"pageCount":1,"pageSize":12,"count":total}
  if(total%12==0){
    meta["pageCount"]=total/12
  }
  else{
    meta["pageCount"]=Math.floor(total/12)+1
  }
  response.send({"ack":true});
});

app.get('/products/:id', async (request, response) => {
  wanted_id = request.params.id;
  result = await collection.find({ "_id": wanted_id }).toArray();
  response.send(result);
})

app.get('/products', async (request, response) => {
  prods = await collection.find({}).toArray();
  const donne={result:prods,meta:meta};
  const d={succes:true,data:donne }
  response.send(d);
})

app.get('/search', async (request, response) => {
  //valeur défaut:
  let brand=["dedicated","montlimart","ADRESSE Paris"];
  let price=100000;
  let page=1;
  let size=12;

  if (request.query.size && parseInt(request.query.size) > 0 && parseInt(request.query.size) <= 48) {
    size = parseInt(request.query.size);
  }
  if (request.query.brand) {
    brand = request.query.brand;
  }
  if (request.query.price && parseFloat(request.query.price) > 0) {
    price = parseFloat(request.query.price);
  }
  if (request.query.page && parseInt(request.query.page)>0 && parseInt(request.query.page)<= 1000){
    page = parseInt(request.query.page);
  }
  meta["pageSize"]=size
  meta["currentPage"]=page
  if(total%size==0){
    meta["pageCount"]=total/size
  }
  else{
    meta["pageCount"]=Math.floor(total/size)+1
  }

  skiped=(page-1)*size

  prods = await collection.find({"brand":{$in:brand},"price":{$lte:price}}).skip(skiped).limit(size).toArray();
  const donne={result:prods,meta:meta};
  const result={succes:true,data:donne}
  response.send(result);
})

module.exports=app;
