const router = require("express").Router();
const { postValidation } = require("../validation");
const Post = require("../models/").postModel;

router.get("/", async (req, res) => {
  let postFound = await Post.find({ author: req.user._id });
  res.send(postFound);
});

router.get("/:postid", async (req, res) => {
  let { postid } = req.params;
  let postFound = await Post.findOne({ _id: postid });
  if (!postFound) {
    res.status(404);
    res.send("Post not found.");
  }

  if (postFound.author.toString() == req.user._id) {
    res.send(postFound);
  } else {
    res.status(403);
    res.send("not allow to update");
  }
});

router.post("/", async (req, res) => {
  //validate the input
  const { error } = postValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    res.status(200).send("New post has been saved.");
  } catch (err) {
    res.status(400).send("Cannot save post.");
  }
});

router.patch("/:_id", async (req, res) => {
  //validate the input
  const { error } = postValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { _id } = req.params;
  let post = await Post.findOne({ _id });
  if (!post) {
    res.status(404);
    return res.send("Post not found.");
  }

  if (post.author.toString() == req.user._id) {
    Post.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    })
      .then(() => {
        res.send("Post updated.");
      })
      .catch((err) => {
        res.status(500);
        res.send(err);
      });
  } else {
    res.status(403);
    return res.send("Not allow to update");
  }
});

router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  let post = await Post.findOne({ _id });
  if (!post) {
    res.status(404);
    return res.json("Post not found.");
  }

  if (post.author.toString() == req.user._id) {
    Post.deleteOne({ _id })
      .then(() => {
        res.send("Post deleted.");
      })
      .catch((err) => {
        res.status(500);
        res.send(err);
      });
  } else {
    res.status(403);
    return res.send("Not allow to delete");
  }
});

module.exports = router;
