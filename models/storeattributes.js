"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StoreAttributes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StoreAttributes.belongsTo(models.Store);
    }
  }
  StoreAttributes.init(
    {
      // stories: DataTypes.STRING,
      // category: DataTypes.STRING,
      // floor: DataTypes.INTEGER,
      // priceRange: DataTypes.STRING,
      // rank: DataTypes.INTEGER,
      name: DataTypes.STRING,
      value: DataTypes.STRING,
      lastUpdate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        set(value) {
          // Prevent manual setting of the lastUpdate column
          throw new Error("Do not set lastUpdate manually.");
        },
      },
    },
    {
      sequelize,
      modelName: "StoreAttributes",
    }
  );
  return StoreAttributes;
};
