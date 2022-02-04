const { OrderList } = require("../../common/models/main.model");

exports.checkIfOrderListIsNotAccepted = async (req, res, next) => {
  const orderList = await OrderList.findOne({
    where: {
      assignedUserId: req.params.userId,
      OrderId: req.params.orderId,
      accepted: true,
    },
  });
  if (orderList === null) {
    return next();
  } else {
    return res.status(400).send({
      message: `Order is already accepted by User: ${orderList.acceptedUserId} at ${orderList.updatedAt}`,
    });
  }
};
