exports.customerPage = (socket) => { 
  return (req, res) => {
    if (socket) {
      socket.emit('something', 'this is new notification');  
    }
    res.send({message: 'This is Customer page'});
  }
};