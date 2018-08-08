const faker = require('faker');
const models = require('./models');
const tr = require('transliter');

const owner = '5b191d6b97a62103cc3443d6';

module.exports = async () => {
  try {
    await models.Post.remove();

    Array.from({ length: 20 }).forEach(async () => {
      const title = faker.lorem.words(5);
      const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;
      await models.Post.create({
        title,
        body: faker.lorem.words(5000),
        owner,
        url
      });
    });
  } catch (e) {
    console.log(e);
  }
};
