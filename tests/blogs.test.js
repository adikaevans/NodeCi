
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe ('When logged in', () => {  /* 'describe' is a global function provided by 'jest'. Like 'test' function we don't need to require it in or import it. It is a synchronous(Not async) function.
describe() allows us to gather our tests into separate groupings within the same file, even multiple nested levels. 'describe' wraps a series of tests. It is a test suit.
* It expects a string and then a callback function which will initialize our tests.*/

  beforeEach(async () => { /*This 'beforeEach' is accessibe to tests/describes nested within this 'describe' statement.*/
    await page.login();
    await page.click('a.btn-floating');
  });
  test ('Can see blog create form', async () => {   
  
    const label = await page.getContentsOf('form label');
  
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', () => {
    beforeEach(async () => {
     await page.type('.title input', 'My Title') ;
     await page.type('.content input', 'My Content');
     await page.click('form button');
    })

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then Saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    })
  })

  describe('And using invalid inputs', () => {
    beforeEach(async ()=> {
      await page.click('form button');
    })
    test ('the form shows an error message', async ()=> {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  })

});

describe('User is Not logged in', () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'T',
        content: 'C'
      }
    }
  ];

  test('Blog related actions are prohibited', async ()=> {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({error: 'You must log in!'});
    }
  })

  /*test('User cannot create blog posts', async () => {
    const result = await page.post('/api/blogs', { title: 'T', content: 'C'});
      expect(result).toEqual({error: 'You must log in!'});
  });
  test('User cannot get a list of posts', async () => {    
    const result = await page.get('/api/blogs');
    expect(result).toEqual({ error: 'You must log in!'})
  });  // This code block has been summerised by 'const actions' above.*/
});