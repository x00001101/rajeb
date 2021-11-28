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
      type: DataTypes.ENUM("1", "5", "15", "2063", "6159"),
      allowNull: false,
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

Order.hasOne(Billing, { onDelete: "cascade" });
Billing.belongsTo(Order);

const Tracking = db.define("Tracking", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  description: DataTypes.TEXT,
});

Order.hasMany(Tracking, { onDelete: "cascade" });
Tracking.belongsTo(Order);
User.hasMany(Tracking);
Tracking.belongsTo(User);

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
      },
    ],
  }
);

User.hasMany(Key);
Key.belongsTo(User);

const Voucher = db.define("Voucher", {
  id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("PERCENT", "VALUE"),
    allowNull: false,
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  maxValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  expiredDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "-1 for unlimited",
    defaultValue: -1,
  },
  limit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "-1 for unlimited, limit per user",
    defaultValue: -1,
  },
});

const Pouch = db.define(
  "Pouch",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

Voucher.hasMany(Pouch, { onDelete: "cascade" });
Voucher.hasMany(Order);
Order.belongsTo(Voucher);
User.hasMany(Pouch, { onDelete: "cascade" });
Pouch.belongsTo(Voucher);
Pouch.belongsTo(User);

const Service = db.define("Service", {
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
  },
  name: DataTypes.STRING,
  setPrice: {
    type: DataTypes.INTEGER(12),
    allowNull: false,
  },
  description: DataTypes.STRING,
});

Service.hasMany(Order);
Order.belongsTo(Service);

const Post = db.define("Post", {
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("DP", "GT", "TC"),
    allowNull: false,
    defaultValue: "DP",
    comment: "DP-Drop Point, GT-Gateway, TC-Transit Center",
  },
});

Post.hasMany(Tracking);
Tracking.belongsTo(Post);

const Code = db.define(
  "Code",
  {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

Code.hasMany(Tracking);
Tracking.belongsTo(Code);

const Wallet = db.define("Wallet", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  balance: DataTypes.DECIMAL(10, 2),
});

User.hasOne(Wallet);
Wallet.belongsTo(User);

exports.User = User;
exports.Order = Order;
exports.Billing = Billing;
exports.Tracking = Tracking;
exports.Key = Key;
exports.Voucher = Voucher;
exports.Pouch = Pouch;
exports.Service = Service;
exports.Post = Post;
exports.Code = Code;
exports.Wallet = Wallet;
