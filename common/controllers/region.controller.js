const { Province, Regency, District, Village } = require("../models/region.model");
const { Op } = require("sequelize");

exports.getRegion = async (req, res) => {
  let src = req.query.src;
  let value = req.query.val;
  let off_lim = {}; // set offset limit
  if (req.query.off) {
    off_lim.offset = Number(req.query.off);
  }
  if (req.query.lim) {
    off_lim.limit = Number(req.query.lim);
  }
  let id = {}; // parrent id
  let out;
  if (src == 'p') {
    if (req.query.pid) {
      id.id = req.query.pid;
    }
    out = await Province.findAll({
      ...off_lim,
      where: {
        name: {
          [Op.substring]: value
        },
        ...id
      },
    });
  } else if (src == 'r') {
    if (req.query.pid) {
      id.ProvinceId = req.query.pid;
    }
    out = await Regency.findAll({
      ...off_lim,
      where: {
        name: {
          [Op.substring]: value
        },
        ...id
      },
    });
  } else if (src == 'd') {
    if (req.query.pid) {
      id.RegencyId = req.query.pid;
    }
    out = await District.findAll({
      ...off_lim,
      where: {
        name: {
          [Op.substring]: value
        },
        ...id
      },
    });
  } else if (src == 'v') {
    if (req.query.pid) {
      id.DistrictId = req.query.pid;
    }
    out = await Village.findAll({
      ...off_lim,
      where: {
        name: {
          [Op.substring]: value
        },
        ...id
      },
    });
  }
  res.send(out);
}