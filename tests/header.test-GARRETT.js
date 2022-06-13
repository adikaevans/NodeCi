//const puppeteer = require('puppeteer'); // library for launching virtual browser(chromium).
//const sessionFactory = require('./factoryFunctions/sessionFactory');// Our required authetication logics.
//const userFactory = require('./factoryFunctions/userFactory'); 
    
    //NOTE: We moved all the above to the '/helpers/page.js' file.

const Page = require('./helpers/page');

/*
test ('Add two numbers', () => { // sample test
  const sum = 1 + 2;

 expect(sum).toEqual(3);
});
 We added ' "test": "jest" ' line on package.json file so we can use 'jest' testing framework module. 
This is just a sample test code that we can run from terminal using 'npm run test' command.*/  

//let browser, page; /* Declaring these variables up here enables us to reuse them in multiple functions.*/

let page;  /* We chose to use 'page' instead of 'CustomPage' for simplicity. 'browser' is moved to 'page.js'(our CustomPage). Browser is  for mainly to create a page.*/

beforeEach(async() => { /* Since we will need to reuse our browser instance plus the page for every test inside our project, we include them in a 'beforeEach' statement which will be automatically executed BEFORE every test that we run.*/
 /* browser = await puppeteer.launch({ //browser window. We moved 'browser' to page.js file. 
    headless: false // head(headless) is the browser graphical user interface.
  });   
  page = await browser.newPage();       //browser tab (single tab window).*/

  page = await Page.build(); /*new page(i.e proxy) from 'page.js' file, which is our CustomPage. It governs access to the customPage, puppeteer page and puppeteer browser.*/

  await page.goto('http://localhost:3000');
});

afterEach(async () => { //Automatically closes the browser AFTER every successful test run.
//await browser.close(); 
  await page.close();
});

test ('The Header has the correct text', async () => {
 /* const text = await page.$eval('a.brand-logo', el => el.innerHTML); // 'el=>el.innerHTML' function gets converted toString by puppeteer and communicated to the browser which also in-turn converts it back to string b4 sending it back to NodeJS.
 * The 'page' variable is our Proxy. When we reference the '$eval' property, the proxy finds the puppeteer page instance and returns it with the $eval function.

 * Above code has been summerised as below from our CustomPage(page.js). We used a simpler function for getting content out of a specific selector inside the page.*/

  const text = await page.getContentsOf('a.brand-logo');

  expect(text).toEqual('Blogster');
});

test ('Clicking Login starts oauth flow', async () => {
  await page.click('.right a'); /* We get '.right a' by right-clicking on the login link from the browser, Inspect and derive it from the immediate class selector plus the link anchor tag. E.g from the console of the inspect, type $('.right a') to veriy the link(Login With Google) is highlighted. */  

  const url = await page.url();
  //console.log(url);

  expect(url).toMatch(/accounts\.google\.com/); //Backslash(\) helps escape the periods(.).
});

//test.only('When signed in, shows logout button', async () => { //'only' allows us to run only this 'test'.
test('When signed in, shows logout button', async () => { // Authentication test

  /* const id = '6269254e35d4bebbb4e1d6d6'; // We No longer need this instance of fixed user id coz we will use the userFactory function to create a new user for us.
  
  const user = await userFactory(); // returns the result of the 'new User({}).save()' function. This is an Asynchronous function(see useFactory.js file) which returns a Promise.It takes time for mongoose to connect to mongoDB instance, save a User and get a confirmation that it was successfully saved.
  
  const { session, sig } = sessionFactory(user); // We destructure the session and sig properties from sessionFactory function.
  sessionFactory requires a user(from userFactory) to be passed-in in order to generate a session and a signature(sig).
  
  await page.setCookie({name: 'session', value: session});
  await page.setCookie({name: 'session.sig', value: sig});
  await page.goto('localhost:3000');
  await page.waitFor('a[href="/auth/logout"]'); // adds a delay to allow for the element to appear.*/

  await page.login(); //Above commented lines of code are included in 'login' function in 'page.js' file.
  
  const text =await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

  expect(text).toEqual('Logout');
});