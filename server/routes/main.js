const router = require("express").Router();
const Post = require("../models/Post");

router.get("", async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      discription: "Simple Blog App Created Using MongoDb & Express",
    };
    // const data = (await Post.find()) || { title: "Nothing To Show" };
    // res.render("index", { locals, data });
    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Post.find().countDocuments(); // count the documents
    // console.log(count);
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    return res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
    res.status(504).send(error);
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });
    const locals = {
      title: data.title,
      discription: "Simple Blog App Created Using MongoDb & Express",
    };

    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
  }
});
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      discription: "Simple Blog App Created Using MongoDb & Express",
    };
    const searchTerm = req.body.searchTerm;
    const newSearchTerm = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(newSearchTerm, "i") } },
        { body: { $regex: new RegExp(newSearchTerm, "i") } },
      ],
    });

    // res.send(searchTerm);
    res.render("search", { locals, data });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
