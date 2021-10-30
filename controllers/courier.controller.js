exports.courierPage = (socket) => {
  return (req, res) => {
    socket.emit("hello", "world");
    res.send({ message: 'This is Courier page' });
  };
};