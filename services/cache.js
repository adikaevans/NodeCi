const mongoose = require('mongoose');
const util = require('util');
const keys = require('../config/keys');

const redis = require('redis');
//const redisUrl = 'redis://127.0.0.1:6379';  // taken to 'ci.js, dev.js' files.
const client = redis.createClient(keys.redisUrl);
client.hGet = util.promisify(client.hGet); /* 'Promisify' takes any function that takes a callback as the last argument and make it Return a Promise. See blogRoutes.txt also.*/  

const exec = mongoose.Query.prototype.exec; // Original default query function.

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true; //'useCache' can be any other name we wish. 
/*Everytime any query is issued inside our App the 'exec' function will run, i.e every query is being cached. In other circumstances we wouldn't need to cache every single query considering that 'redis' storage is pretty expensive. So we will now use cache only where necessary.
Note: All the queries that we create, inherit from 'Query.prototype' as seen above. There4 any function(e.g cache,exec) that we add to the prototype object will be available to any query that we create inside of our App.
E.g 'const blogs = await Blog.find({_user:req.user.id}).cache();' will set the value of 'this.useCache' to 'true' for ONLY the current query and non other.*/

  this.hashKey = JSON.stringify(options.key || '');/* 'hashKey'(any other name) is our top level cache key which can be followed by other nested keys(e.g {id:,collection:'users'}). 
 The key must always be a number or a string(stringify). If someone does Not pass a key, then we returned an empty string('') to avoid getting 'undefined' error.
 NB: To ensure code reusability, we can pass-in a key property on the cache on the 'options' object(of the cache function), which will be what we use as the top-level hash key. It doesn't have to be user Id, it can be any value we want*/

  return this; //this return statement enables cache function to be chainable to other queries.
};

mongoose.Query.prototype.exec = async function() { /* We try to customize above default exec query. Notice we used 'function' key word and NOT an arrow function coz an arrow function will try to mess with the value of 'this'(query instance). Our function here is assigned to the value of the 'prototype' property.
Below is some code that will run before any query(exec) is executed by mongoose.*/
  
if(!this.useCache) {  
    return exec.apply(this, arguments);
/* NB: Both exec and cache functions exist in the same Query instance, there4 we can reference 'useCache' here.
Using 'if' statement, we check if 'useCache' is true and run all the caching logic below. Otherwise if false, we skip all the caching logic and simply run the original exec function that does not involve any caching logic whatsoever.*/    
  }

/*console.log('AM ABOUT TO RUN A QUERY');
  console.log(this.getQuery());  // 'this' referes to the current query(e.g find user by id)
  console.log(this.mongooseCollection.name);*/

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {collection:this.mongooseCollection.name}));
  /* 'Object.assign' is used to copy properties from one object to another. So we combine the result of 'getQuery' with the Collection name and save in the empty Object({}.Then we Stringify the resulting Object before we can assign as 'key' for cache(redis) queries.*/  
  
  console.log(key);  
 
  // See if we have a value for 'key' in redis i.e if the query is already in cache memory
 const cacheValue = await client.hGet(this.hashKey, key);/* We use 'hGet' instead of 'get' for pulling information from a Nested hash key.*/
 
 // If we do, return that
  if(cacheValue) {     
    const doc = JSON.parse(cacheValue); 
    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(d);
/* Ternary expression to check if('?') the returned record(doc) is a single Object or an Array of Objects. 'isArray' will return 'true' if doc is an Array of objects.So in the case of an Array, we need to iterate(map) over the doc Array and return a document(d) instance for each record.
Otherwise(':') in the case of a single record we return doc in an instance of the model class. 
'this' refers to the current query.*/
  }

  //Otherwise, pass the query to MongoDB and store(cache) the result in redis for future reference.
  const result = await exec.apply(this, arguments);
  await client.hSet(this.hashKey, key, JSON.stringify(result), 'EX', 10); /* 'EX' cache expiration -> 10 seconds.*/
  return result;  
}

module.exports = {
  clearHash(hashKey) {     // Clears the content of the hash key.
    client.del(JSON.stringify(hashKey));
  }
}

/* So far our query has been based on the 'id' key. This wouldn't work when we introduce other collections(e.g users,blogs,tweets) or query options. There4 we figured-out a more robust solution for generating cache keys by customizing the default exec query function.*/