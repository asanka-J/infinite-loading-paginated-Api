const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./users");

const mongo_url = `mongodb://${process.env.MONGO_USERNAME}:${encodeURIComponent(
  process.env.MONGO_PASS
)}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${
  process.env.MONGO_DB
}?authSource=admin`;
/*database config  end*/

mongoose.connect(mongo_url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.once("open", async () => {
  if ((await User.countDocuments().exec()) > 0) return;

  Promise.all([
    User.create({ name: "User 1" }),
    User.create({ name: "User 2" }),
    User.create({ name: "User 3" }),
    User.create({ name: "User 4" }),
    User.create({ name: "User 5" }),
    User.create({ name: "User 6" }),
    User.create({ name: "User 7" }),
    User.create({ name: "User 8" }),
    User.create({ name: "User 9" }),
    User.create({ name: "User 10" }),
    User.create({ name: "User 11" }),
    User.create({ name: "User 12" })
  ]).then(() => console.log("Added Users"));
});

app.get("/users", paginatedResults(User), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const results = {};

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const document_count = await model.countDocuments().exec();
    results.total_pages = document_count / parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    if (endIndex < document_count) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec();
      res.paginatedResults = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

app.listen(8000);
