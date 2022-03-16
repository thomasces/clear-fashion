const { MongoClient } = require('mongodb');
const MONGODB_URI = 'mongodb+srv://admin:lKg6bfK9APixjW4v@cluster0.kibuz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashionbythomas';
const products = require('./products.json');
let collection;

const connect = async () => {
    const client = await MongoClient.connect(MONGODB_URI, { 'useNewUrlParser': true });
    const db = client.db(MONGODB_DB_NAME);
    collection = db.collection('products');
    //collection.insertMany(products);
    await brandProduct("montlimart");
    await priceProduct(10);
    await priceSorted();
    await dateSorted();
    await recentProds();
    process.exit(0);
}

const brandProduct= async (brand) =>{
    const result= await collection.find({brand}).toArray();
    console.log(result);
}

const priceProduct= async (price) =>{
    const result= await collection.find({"price": {$lte : price}}).toArray();
    console.log(result);
}

const priceSorted= async () =>{
    const result= await collection.find({}).sort({ "price": -1 }).toArray();
    console.log(result[0]);
    console.log(result[result.length-1]);
}

const dateSorted= async ()=>{
    const result= await collection.find({}).sort({ "date": -1 }).toArray();
    console.log(result[0]);
    console.log(result[result.length-1]);
}

const date = new Date()
const past = date.getDate() - 14;
date.setDate(past);
final=date.toLocaleDateString('fr-FR')

const recentProds= async ()=>{
    const result= await collection.find({ "date": {$gte :final} }).toArray();
    console.log(result);
}
connect();
