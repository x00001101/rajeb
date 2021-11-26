const db = require("../config/database");
const { DataTypes } = require("sequelize");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissionLevel: {
      type: DataTypes.ENUM("1","5","15","2063","6159"),
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        unique: true,
        fields: ["phoneNumber"],
      },
      {
        name: "email",
        fields: ["email"],
      },
      {
        name: "id",
        fields: ["id"],
      },
      {
        name: "phone",
        fields: ["phoneNumber"],
      },
    ],
  }
);

const Order = db.define(
  "Order",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    senderFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderOriginId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderPostCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipientFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientDestinationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientPostCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemName: DataTypes.STRING,
    itemTypeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemQty: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    itemWeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    itemDimension: DataTypes.STRING,
    itemValue: DataTypes.INTEGER,
    insurance: DataTypes.BOOLEAN,
    voucherId: DataTypes.STRING(50),
  },
  {
    indexes: [
      {
        name: "order_id",
        fields: ["id"],
      },
    ],
  }
);

User.hasMany(Order);
Order.belongsTo(User);

const Billing = db.define(
  "Billing",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    voucherAmount: DataTypes.DECIMAL(10, 2),
    insuranceAmount: DataTypes.DECIMAL(10, 2),
    serviceAmount: DataTypes.DECIMAL(10, 2),
    totalAmount: DataTypes.DECIMAL(10, 2),
    paid: DataTypes.BOOLEAN,
  },
  {
    indexes: [
      {
        name: "id",
        fields: ["id"],
      },
    ],
  }
);

Order.hasOne(Billing, { onDelete: 'cascade' });
Billing.belongsTo(Order);

const Tracking = db.define("Tracking", {
  codeId: DataTypes.STRING(10),
  postId: DataTypes.STRING(10),
  postType: DataTypes.STRING(5),
  userId: DataTypes.UUID,
  description: DataTypes.TEXT,
});

Order.hasMany(Tracking, { onDelete: 'cascade' });
Tracking.belongsTo(Order);

const Key = db.define(
  "Key",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    otp: {
      type: DataTypes.INTEGER(6),
    },
    activeKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiredDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    enum: {
      type: DataTypes.INTEGER, // 1 email activator, 2 password reset key, 3 otp
      defaultValue: 1,
    },
  },
  {
    indexes: [
      {
        name: "key_activation",
        fields: ["activeKey", "enum", "expiredDate"],
      },
      {
        name: "otp_management",
        fields: ["userId", "otp", "enum", "expiredDate"],
      },
      {
        name: "key_generator",
        fields: ["activeKey"],
      }
    ],
  }
);

User.hasMany(Key);
Key.belongsTo(User);

exports.User = User;
exports.Order = Order;
exports.Billing = Billing;
exports.Tracking = Tracking;
exports.Key = Key;