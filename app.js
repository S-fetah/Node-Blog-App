require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const connectDB = require("./server/config/db");
const { isActiveRoute } = require("./server/helpers/routeHelpers");

//routes
const homeRoutes = require("./server/routes/main");
const adminRoutes = require("./server/routes/admin");

const app = express();
const PORT = 4000 || process.env.PORT;

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "VPN123",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
  })
);

app.use(express.static("public"));

app.use(expressLayout);

app.set("layout", "./layouts/main");

app.set("view engine", "ejs");

app.use("/", adminRoutes);
app.use("/", homeRoutes);

app.listen(PORT, () => {
  console.log("server is listening in http://localhost:" + PORT);
});
