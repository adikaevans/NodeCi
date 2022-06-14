const puppeteer = require('puppeteer');
const sessionFactory = require('../factoryFunctions/sessionFactory');
const userFactory = require('../factoryFunctions/userFactory');

class CustomPage {
  static async build() { 
    const browser = await puppeteer.launch({ //browser is used to create the page and nothing else.
      headless: true,
      args: ['--no-sandbox'] // helps avoid messing with settings assigned by travis virtual machine.
    });
    
    const page = await browser.newPage();      // puppeteer page
    const customPage = new CustomPage(page);   // instance of our CustomPage

    return new Proxy(customPage, {   // Proxy Object to combine page and our CustomPage.See 'testsNotes.txt'
      get: function(target, property) {
        return target[property] || browser[property] || page[property];
/* This Proxy is combining access to three objects; customPage, page and browser. We can there4 add functions to e.g customPage property and call them. We can directly access browser and page as well.
* Note the order in which we placed the three Objects. This helps with the 'close()' function of our page.We look for the close() function from the three objects in the order, thus avoiding mulfunction.*/        
      }
    })
  }

  constructor(page) {
    this.page = page; //Whenever we create a new instance of CustomPage, we save on 'this.page'.
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

  await this.page.setCookie({name: 'session', value: session}); /*'page' variable from 'header.test.js' becomes 'this.page' as declared in the constructor above.*/

  await this.page.setCookie({name: 'session.sig', value: sig});
  await this.page.goto('http://localhost:3000/blogs');
  await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate((_path) => {
        return fetch(_path, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()); 
      }, path);
  }

  post(path, data) {
    return this.page.evaluate((_path, _data) => {
      return fetch(_path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_data)
      }).then(res => res.json());
    }, path, data);
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({method, path, data}) => {//Destructuring actions array(blogs.test.js)
        return this[method](path, data); /* 'this' referes to this 'page'. method array refers to get, post. Note: get method has no 'data' option, so data key will just return Undefined for 'get' action. These are all an Array of promises.*/
      })
    );
  }
}

module.exports = CustomPage; // We export this CustomPage for authentication use in 'header.test.js' file.

/* Now we don't need to repeat all the above Authentication logic stuff through-out our test suit. We can easily login into our application by simply calling 'page.login()'.
* We now have a single place to write a tonne of re-usable logic inside of our test suit e.g to pull content out of our page(getContentsOf()), see 'header.test.js' file - test ('The Header has the correct text'.*/