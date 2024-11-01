const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const adminLayout = "../views/layouts/admin";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//jwt secret
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("<h3>Unauthorized</h3>");
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return send.status(401).send("<h3>Unauthorized</h3>");
  }
};

const checkLooged = (req, res, next) => {
  const token = req.cookies.token || null;
  if (!token) {
    return next();
  }
  res.redirect("/dashboard");
};
router.get("/admin", checkLooged, (req, res) => {
  try {
    const locals = {
      title: "Admin Space",
      discription: "Simple Blog App Created Using MongoDb & Express",
    };
    res.render("admin/index.ejs", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
router.post("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin Space",
      discription: "Simple Blog App Created Using MongoDb & Express",
    };

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found");
      return res.status(401).send("<h1>Invalid Credentials</h1>"); // Only send the status and message
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "<h1>Invalid Credentials</h1>" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("Server error"); // Send response in case of error
  }
});

// sign up route
router.post("/SignUp", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username);
  console.log(email);
  console.log(password);
  const hashedPassword = await bcrypt.hash(password, 10);
  //   const locals = {
  //     title: "Admin Space",
  //     discription: "Simple Blog App Created Using MongoDb & Express",
  //   };
  try {
    const user = await User.create({
      username,
      email: email,
      passwordf: hashedPassword,
    });

    res.status(201).json({ message: "User Created Successfully!", user });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: "user Already in use!" });
    }
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      discription: "Simple Blog App Created Using MongoDb & Express",
    };
    const data = await Post.find();
    res.render("admin/dashboard", { locals, data, layout: adminLayout });
  } catch (error) {
    return res
      .status(501)
      .send(
        `Something went Wrong!  <a href="/admin"> Please Try Again here</a>`
      );
  }
});
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      discription: "Simple Blog App Created Using MongoDb & Express",
    };

    res.render("admin/add-post", { locals, layout: adminLayout });
  } catch (error) {
    return res
      .status(501)
      .send(
        `Something went Wrong!  <a href="/admin"> Please Try Again here</a>`
      );
  }
});
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      discription: "Simple Blog App Created Using MongoDb & Express",
    };
    const data = req.params.id;
    const post = await Post.findOne({ _id: data });

    if (!post) {
      return res.status(404).send("Post NOT FOUND!");
    }
    return res.render("admin/edit-post", { locals, post, layout: adminLayout });
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.put("/edit-post/:id", async (req, res) => {
  const id = req.params.id;
  const { title, body } = req.body;
  try {
    const updatedPost = await Post.findById(id).updateOne({
      title: title ? title : "",
      body: body ? body : "",
      updatedAt: Date.now(),
    });
    console.log(updatedPost);
    return res.status(200).send(updatedPost);
  } catch (error) {
    console.log(error);
    return res.status(401).send("Something Went Wrong!! , Couldnt Edit Post");
  }
});

router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;
    // console.log(title);
    // console.log(body);
    const post = await Post.findOne({ title });
    // console.log(post);

    if (post) {
      return res.status(401).send("POST NAME EXISTS");
    }
    const newPost = await Post.create({ title, body });

    if (!newPost) {
      return res.status(401).send("POST Has Not Been added !");
    }
    return res.status(201).send("POST Created Successfully");
  } catch (error) {
    return res
      .status(501)
      .send(
        `Something went Wrong!  <a href="/add-post"> Please Try Again here</a>`
      );
  }
});
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    await Post.findOneAndDelete({ _id: id });
    return res.status(204).redirect("/dashboard");
  } catch (error) {
    return res.status(500).redirect("/dashboard");
  }
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});
module.exports = router;
