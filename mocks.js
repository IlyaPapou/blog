const faker = require('faker');
const models = require('./models');
const TurndownService = require('turndown');

const owner = '5b191d6b97a62103cc3443d6';

module.exports = () => {
  models.Post.remove()
    .then(() => {
      Array.from({ length: 20 }).forEach(() => {
        const turndownService = new TurndownService();
        models.Post.create({
          title: faker.lorem.words(5),
          body: turndownService.turndown(faker.lorem.words(9999)),
          owner
        })
          .then()
          .catch(console.log);
      });
    })
    .catch(console.log);
};
