"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Store.hasMany(models.Post);
      Store.hasMany(models.StoreAttributes);
      Store.hasMany(models.VendorTransaction);

      Store.belongsTo(models.User);
    }
  }
  Store.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: DataTypes.STRING,
      // stories: DataTypes.STRING,
      // category: DataTypes.STRING,
      // floor: DataTypes.INTEGER,
      // priceRange: DataTypes.STRING,
      // rank: DataTypes.INTEGER,
      // lastUpdate: {
      //   type: DataTypes.DATE,
      //   allowNull: false,
      //   defaultValue: DataTypes.NOW,
      //   set(value) {
      //     // Prevent manual setting of the lastUpdate column
      //     throw new Error("Do not set lastUpdate manually.");
      //   },
      // },
    },
    {
      sequelize,
      modelName: "Store",
    }
  );

  // Store.beforeCreate(async (store) => {
  //   const nextId = await getNextId();
  //   store.id = `St${nextId.toString().padStart(4, "0")}`;
  // });

  // // SQL function to retrieve the next sequence number
  // async function getNextId() {
  //   const result = await sequelize.query(
  //     "SELECT nextval('store_sequence') AS next_id"
  //   );
  //   return result[0][0].next_id;
  // }
  return Store;
};
