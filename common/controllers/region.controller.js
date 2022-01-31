const {
  Province,
  Regency,
  District,
  Village,
} = require("../models/region.model");
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
  if (req.query.covered == "true") {
    req.query.covered = 1;
  } else if (req.query.covered == "false") {
    req.query.covered = 0;
  } else {
    req.query.covered = 0;
  }
  let id = {}; // parrent id
  let out;
  if (src.length == 1) {
    if (src == "p") {
      if (req.query.pid) {
        id.id = req.query.pid;
      }
      if (req.query.covered) {
        id.covered = req.query.covered;
      }
      out = await Province.findAll({
        ...off_lim,
        where: {
          name: {
            [Op.substring]: value,
          },
          ...id,
        },
      });
    } else if (src == "r") {
      if (req.query.pid) {
        id.ProvinceId = req.query.pid;
      }
      if (req.query.covered) {
        id.covered = req.query.covered;
      }
      out = await Regency.findAll({
        ...off_lim,
        where: {
          name: {
            [Op.substring]: value,
          },
          ...id,
        },
        include: [
          {
            model: Province,
            required: true,
            attributes: ["name"],
          },
        ],
      });
    } else if (src == "d") {
      if (req.query.pid) {
        id.RegencyId = req.query.pid;
      }
      if (req.query.covered) {
        id.covered = req.query.covered;
      }
      out = await District.findAll({
        ...off_lim,
        where: {
          name: {
            [Op.substring]: value,
          },
          ...id,
        },
        include: [
          {
            model: Regency,
            required: true,
            attributes: ["name"],
            include: [
              {
                model: Province,
                required: true,
                attributes: ["name"],
              },
            ],
          },
        ],
      });
    } else if (src == "v") {
      if (req.query.pid) {
        id.DistrictId = req.query.pid;
      }
      if (req.query.covered) {
        id.covered = req.query.covered;
      }
      out = await Village.findAll({
        ...off_lim,
        where: {
          name: {
            [Op.substring]: value,
          },
          ...id,
        },
        include: [
          {
            model: District,
            required: true,
            attributes: ["name"],
            include: [
              {
                model: Regency,
                required: true,
                attributes: ["name"],
                include: [
                  {
                    model: Province,
                    required: true,
                    attributes: ["name"],
                  },
                ],
              },
            ],
          },
        ],
      });
    }
  } else {
    // var i = src.length;
    let outs = [];
    for (var i = 0; i < src.length; i++) {
      outs.push(src.charAt(i));
    }
    return res.send(outs);
  }
  return res.send(out);
};
