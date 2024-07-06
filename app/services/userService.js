const userRepository = require("../repositories/carRepository");

module.exports = {
  async create(requestBody) {
    return userRepository.create(requestBody);
  },

  update(id, requestBody) {
    return userRepository.update(id, requestBody);
  },

  delete(id) {
    return userRepository.delete(id);
  },

  async list() {
    try {
      const users = await userRepository.findAll();
      const userCount = await userRepository.getTotalUser();

      return {
        data: users,
        count: userCount,
      };
    } catch (err) {
      throw err;
    }
  },

  async get(id) {
    return userRepository.find(id);
  },

  async findOne(email) {
    return userRepository.findOne(email);
  },
};
