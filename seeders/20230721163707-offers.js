"use strict";

const models = require("../models/index");
const { sequelize } = require("../models");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await sequelize.sync({ force: true, alter: true });

    try {
      // for (let i = 1; i <= 3; i++) {

      await models.Offer.create({
        by_store: `Store1`,
        target_store: `Store2`,
        target_price: 5000,
        description: "20% off on purchase of 2000",
      });

      await models.Offer.create({
        by_store: `Store2`,
        target_store: `Store1`,
        target_price: 2000,
        description: "10% off on purchase of 1000",
      });
      await models.Offer.create({
        by_store: `Store2`,
        target_store: `Store1`,
        target_price: 5000,
        description: "20% off on purchase of 2000",
      });
      // }
      function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      for (let i = 1; i <= 10; i++) {
        let store = await models.Store.create({
          name: `store${i}`,
          // stories: "Sdn",
          // category: "Kid",
          // floor: i,
          // priceRange: "100-500",
          // rank: getRandomNumber(1, 10),
        });

        for (let i = 1; i <= 5; i++) {
          if (i == 1) {
            await models.StoreAttributes.create({
              name: "stories",
              value: "Sdn",
              StoreId: store.id,
            });
          }
          if (i == 2) {
            await models.StoreAttributes.create({
              name: "category",
              value: "Kid",
              StoreId: store.id,
            });
          }
          if (i == 3) {
            await models.StoreAttributes.create({
              name: "floor",
              value: `${i}`,
              StoreId: store.id,
            });
          }
          if (i == 4) {
            await models.StoreAttributes.create({
              name: "priceRange",
              value: `100-500`,
              StoreId: store.id,
            });
          }
          if (i == 5) {
            await models.StoreAttributes.create({
              name: "rank",
              value: `${getRandomNumber(1, 10)}`,
              StoreId: store.id,
            });
          }
        }
        for (let j = 1; j <= 4; j++) {
          await models.Post.create({
            imageUrl: `url #${j}`,
            caption: `Text #${j}`,
            rank: getRandomNumber(1, 10),
            StoreId: store.id,
          });
        }
      }

      for (let i = 1; i <= 3; i++) {
        await models.User.create({
          name: `User${i}`,
          ph: `92334`,
        });
      }

      // await models.VendorTransaction.create({
      //   invoice: "inv123",
      // });

      let usertest = await models.User.create({
        name: `UserTest`,
        ph: `923347535771`,
        type: "Vendor",
      });
      let store = await models.Store.create({
        name: `store Testing`,
        UserId: usertest.id,
        // stories: "Sdn",
        // category: "Kid",
        // floor: i,
        // priceRange: "100-500",
        // rank: getRandomNumber(1, 10),
      });

      for (let i = 1; i <= 5; i++) {
        if (i == 1) {
          await models.StoreAttributes.create({
            name: "stories",
            value: "Sdn",
            StoreId: store.id,
          });
        }
        if (i == 2) {
          await models.StoreAttributes.create({
            name: "category",
            value: "Kid",
            StoreId: store.id,
          });
        }
        if (i == 3) {
          await models.StoreAttributes.create({
            name: "floor",
            value: `${i}`,
            StoreId: store.id,
          });
        }
        if (i == 4) {
          await models.StoreAttributes.create({
            name: "priceRange",
            value: `100-500`,
            StoreId: store.id,
          });
        }
        if (i == 5) {
          await models.StoreAttributes.create({
            name: "rank",
            value: `${getRandomNumber(1, 10)}`,
            StoreId: store.id,
          });
        }
      }
      for (let j = 1; j <= 4; j++) {
        await models.Post.create({
          imageUrl: `url #${j}`,
          caption: `Text #${j}`,
          rank: getRandomNumber(1, 10),
          StoreId: store.id,
        });
      }

      let usertest1 = await models.User.create({
        name: `UserTest2`,
        ph: `918008974581`,
        type: "Vendor",
      });
      let store2 = await models.Store.create({
        name: `store Testing`,
        UserId: usertest1.id,
        // stories: "Sdn",
        // category: "Kid",
        // floor: i,
        // priceRange: "100-500",
        // rank: getRandomNumber(1, 10),
      });

      for (let i = 1; i <= 5; i++) {
        if (i == 1) {
          await models.StoreAttributes.create({
            name: "stories",
            value: "Sdn",
            StoreId: store2.id,
          });
        }
        if (i == 2) {
          await models.StoreAttributes.create({
            name: "category",
            value: "Kid",
            StoreId: store2.id,
          });
        }
        if (i == 3) {
          await models.StoreAttributes.create({
            name: "floor",
            value: `${i}`,
            StoreId: store2.id,
          });
        }
        if (i == 4) {
          await models.StoreAttributes.create({
            name: "priceRange",
            value: `100-500`,
            StoreId: store2.id,
          });
        }
        if (i == 5) {
          await models.StoreAttributes.create({
            name: "rank",
            value: `${getRandomNumber(1, 10)}`,
            StoreId: store2.id,
          });
        }
      }
    } catch (error) {
      console.log("Error", error);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
