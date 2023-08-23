"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VendorTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      VendorTransaction.belongsTo(models.Store);
      VendorTransaction.belongsTo(models.User);
    }
  }
  VendorTransaction.init(
    {
      // id: {
      //   allowNull: false,
      //   type: DataTypes.INTEGER,
      //   primaryKey: true,
      //   // defaultValue: DataTypes.UUIDV4,
      // },

      invoice: DataTypes.STRING,
      billingAmount: DataTypes.INTEGER,
      codeCreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      otp: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      codeSubmission: {
        type: DataTypes.DATE,
        // allowNull: false,
        // defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "VendorTransaction",
    }
  );
  return VendorTransaction;
};
