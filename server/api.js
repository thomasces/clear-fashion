const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' })
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'clearfashionbythomas';
let collection;
let data;
let client;

const PORT = 8092;
const app = express();
module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());
app.options('*', cors());

app.get('/', (request, response) => {
  response.send({ 'ack': true });
});

app.get('/products/:id', async (request, response) => {
  wanted_id = request.params.id;
  result = await collection.find({ "_id": wanted_id }).toArray();
  response.send(result);
})

app.get('/search', async (request, response) => {
  //valeur défaut de limit:
  let limit = 12;
  let brand=["dedicated","montlimart","ADRESSE Paris"];
  let price=100000;

  if (request.query.limit && parseInt(request.query.limit) > 0 && parseInt(request.query.limit) <= 48) {
    limit = parseInt(request.query.limit);
  }
  if (request.query.brand) {
    brand = request.query.brand;
  }
  if (request.query.price && parseFloat(request.query.limit) > 0) {
    console.log("toto");
    price = parseFloat(request.query.price);
  }
  result = await collection.find({"brand":{$in:brand},"price":{$lte:price}}).limit(limit).toArray();
  result = [{"limit":limit, "total":result.length,"result":result}]
  response.send(result);
})


app.listen(PORT, async () => {
  client = await MongoClient.connect(MONGODB_URI, { 'useNewUrlParser': true });
  data = client.db(MONGODB_DB_NAME);
  collection = data.collection('products');
})

console.log(`📡 Running on port ${PORT}`);
