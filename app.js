const express = require("express");
const app = express();
app.use(express.json());
const {
  models: { User, Note },
} = require("./db");
const path = require("path");

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.get("/api/users/:id/notes", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: {
        model: Note,
      },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", async (req, res, next) => {
  try {
    // res.send(await User.byToken(req.headers.authorization));
    const token = req.headers.authorization;
    const returnedUser = await User.byToken(token);

    // check userId from JWT matches req
    if (returnedUser) {
      req.user = returnedUser;
      res.send(req.user);
    } else {
      res.status(404).send("error, invalid login");
    }
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
