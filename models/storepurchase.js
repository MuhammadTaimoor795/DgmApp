"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class storePurchase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  storePurchase.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      generated_at_store: DataTypes.STRING,
      invoice_id: DataTypes.STRING,
      invoice_amount: DataTypes.STRING,
      ph: DataTypes.STRING,
      //offers: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
      modelName: "storePurchase",
    }
  );
  return storePurchase;
};
