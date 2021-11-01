exports.courierPage = (socket) => {
  return (req, res) => {
    if (socket) {
      socket.emit("hello", "world");
    }
    res.send({ message: 'This is Courier page' });
  };
};