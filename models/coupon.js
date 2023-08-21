"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Coupon.belongsTo(models.Offer);
    }
  }
  Coupon.init(
    {
      cup_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        defaultValue: () => `CUS${Math.floor(Math.random() * 10000)}`, // Default value to generate customId
      },
      generated_at_store: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Coupon",
    }
  );

  // Coupon.beforeCreate((coupon, options) => {
  //   const randomNumber = Math.floor(Math.random() * 10000); // Change the range as needed
  // //  coupon.customId = `CUS${randomNumber}`;
  // });

  return Coupon;
};
