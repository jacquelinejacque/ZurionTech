import { DataTypes } from "sequelize";

class User {
  static init(sequelize) {
    return sequelize.define("Users", {
      userID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "email",
      },
      password: {
        type: DataTypes.STRING,
      },
      idNumber: {
        type: DataTypes.STRING,
      },
      session: {
        type: DataTypes.STRING,
      },      
      expiry: {
        type: DataTypes.DATE,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
      },
      gender: {
        type: DataTypes.STRING,
      },
      organisation: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['active', 'deleted'],
        defaultValue: 'active'
      },
    });
  }
}

export default User;