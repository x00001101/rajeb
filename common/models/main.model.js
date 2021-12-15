const db = require("../config/database");
const { DataTypes } = require("sequelize");
const { Village, District } = require("./region.model");
const SettingModel = require("./setting.model");

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

const Type = db.define(
  "Type",
  {
    id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    description: DataTypes.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
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
    recipientAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipientPostCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    itemName: DataTypes.STRING,
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
    finished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
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
Type.hasMany(Order);
Order.belongsTo(User);
Order.belongsTo(Village, { as: "origin" });
Order.belongsTo(Village, { as: "destination" });
Order.belongsTo(Type);

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
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
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
  packing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
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
  type: {
    type: DataTypes.ENUM("DP", "GT", "TC"),
    allowNull: false,
    defaultValue: "DP",
    comment: "DP-Drop Point, GT-Gateway, TC-Transit Center",
  },
});

Post.belongsTo(District, { as: "region" });
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

const CodeAttribute = db.define(
  "CodeAttribute",
  {
    value: {
      type: DataTypes.ENUM("FINISH"),
      allowNull: false,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    indexes: [
      {
        fields: ["value"],
      },
    ],
  }
);

Code.hasMany(CodeAttribute);
CodeAttribute.belongsTo(Code);

const Wallet = db.define("Wallet", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  balance: DataTypes.DECIMAL(10, 2),
});

User.hasOne(Wallet, { onDelete: "cascade" });
Wallet.belongsTo(User);

// for operational money
const Envelope = db.define("Envelope", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  balance: DataTypes.DECIMAL(10, 2),
});

User.hasOne(Envelope, { onDelete: "cascade" });
Envelope.belongsTo(User);

const Packing = db.define("Packing", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("UNLOCKED", "LOCKED", "CHECKING", "DONE"),
    defaultValue: "UNLOCKED",
  },
});

const PackingList = db.define(
  "PackingList",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    checked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);
Packing.belongsTo(Post, { as: "fromPost" });
Packing.belongsTo(Post, { as: "toPost" });
Packing.hasMany(PackingList);
PackingList.belongsTo(Packing);
Order.hasOne(PackingList);
PackingList.belongsTo(Order);

const Room = db.define(
  "Room",
  {
    id: {
      type: DataTypes.STRING(40),
      primaryKey: true,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);
User.hasOne(Room);
Room.belongsTo(User);

const CourierTransaction = db.define("CourierTransaction", {
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  mutation: {
    type: DataTypes.ENUM("IN", "OUT"),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("O_P", "B_F", "P_C", "P_S"),
    comment:
      "O_P: Order Payment; B_F: Balance Filling; P_C: Payment Company; P_S: Payment Self",
    allowNull: false,
  },
  transaction: {
    type: DataTypes.ENUM("W", "E", "O"),
    comment: "W: Wallet; E: Envelope, O: Outside",
    allowNull: false,
  },
});

User.hasMany(CourierTransaction);
CourierTransaction.belongsTo(User);
Billing.hasMany(CourierTransaction);
CourierTransaction.belongsTo(Billing);

const BillingType = db.define("BillingType", {
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
  },
  autoPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  payToCust: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  description: DataTypes.STRING,
});

BillingType.hasMany(Billing);
Billing.belongsTo(BillingType);

const prices = async (
  servicePrice,
  weight,
  height,
  width,
  long,
  origin,
  destination
) => {
  let out = {};
  out.weight = weight;
  out.height = height;
  out.long = long;
  // set the price according to the distance

  const settings = await SettingModel.findOne({ where: { id: "SETTING" } });
  if (settings === null) {
    out.error = "Setting not set!";
    return out;
  }
  const ootPercentage = settings.ootPercentage; //oot percentage = out of town

  if (
    origin.substring(0, 4) !== destination.substring(0, 4) // if regency id is not the same so it is out of town
  ) {
    servicePrice = (Number(servicePrice) * Number(ootPercentage)) / 100;
  }
  if (height != 0 && width != 0 && long != 0) {
    const weightTotal = (height * width * long) / settings.converter;
    if (Math.round(weightTotal) > Math.round(weight)) {
      out.price = Math.round(weightTotal) * servicePrice;
    } else {
      out.price = Math.round(weight) * servicePrice;
    }
    return out;
  }
  out.price = Math.round(weight) * servicePrice;
  return out;
};

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
exports.CodeAttribute = CodeAttribute;
exports.Wallet = Wallet;
exports.Envelope = Envelope;
exports.Packing = Packing;
exports.PackingList = PackingList;
exports.Room = Room;
exports.Type = Type;
exports.CourierTransaction = CourierTransaction;
exports.BillingType = BillingType;
exports.prices = prices;
