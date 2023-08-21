// creating constants for dependencies
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const ejs = require("ejs");
const app = express();
const Users = require("./models/Users");
const Stories = require("./models/Stories");
const Slides = require("./models/Slides");
const BookmarkedSlides = require("./models/BookmarkedSlide");

dotenv.config();
app.use(cors());
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

//user authenication
const isAuthenticated = (req, res, next) => {
  try {
    console.log(req.headers.token);
    jwt.verify(req.headers.token, process.env.PRIVATE_KEY);
    console.log("authenicated");
    next();
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
};

// get requests
app.get('/' , (req,res)=>{
  res.send('dont worry ')
})
app.get("/health-api", (req, res) => {
  res.json({ messahe: "all ok no worries!" });
});

//get the categories

app.get("/api/get-categories", async (req, res) => {
  try {
    const slides = await Slides.find();
    const all_categories = await slides.flatMap((slides) => slides.categories);
    unique = [...new Set(all_categories)];

    res.json(unique);
  } catch (error) {
    res.json({ status: "failed to get categories" });
  }
});

//get slides based on categories
app.get(`/api/slides/`, async (req, res) => {
  let category = req.query.category;
 

  let search = req.query.search || "";
  try {
    let Slide = await Slides.find({
      categories: { $regex: search, $options: "i" },
    })
      .where("categories")
      .in(category);

    res.json({ status: "product fetched successfully", slides: Slide });
  } catch (err) {
    res.send({ status: "failed" });
  }
});

//get bookmarked slides of a user
app.get("/api/bookmarksSlides", async (req, res) => {
  const {userId} = req.query;
  try { 
    const slidess = await BookmarkedSlides.find({userId});
    res.send(slidess)
  }catch(err){
    res.json(err)
  }
});

// to get slide info to edit it
app.get("/api/slide", async (req, res) => {
  try {
    const id = req.query.id;
    let search = req.query.search || "";

    let slide = await Slides.find({
      story_id: { $regex: search, $options: "i" },
    })
      .where("story_id")
      .in(id);
    res.json(slide);
  } catch (error) {
    res.json(error);
  }
});

// get your stories
app.get("/api/yourStories", async(req,res)=>{
 
  try {
    const user_names = req.query.name;
    console.log(user_names)
    let search = req.query.search || "";

    const story = await Stories.find({
      user_name: { $regex: search, $options: "i" },
    })
      .where("user_name")
      .in(user_names);
    res.json(story);
  } catch (error) {
    res.json(error);
  }

})

// get user id 
app.get('/api/user_id', async(req,res)=>{
  try{
   
    const {user_nm} = req.query;
    // res.send(user_nm )
    // console.log(typeof(user_nm))
   
    const user = await Users.findOne({ user_nm });
    res.send(user._id);
    // const user_id = await Users.find({username:user});
    // res.json(user_id);
   
  

  }catch(error){
    res.json({'error':error})
  }   
})

// post requests

// sign up request

app.post("/api/register", async (req, res) => {
  const { username, pass_word } = req.body;
  console.log(username, pass_word);

  try {
    const user = await Users.findOne({ username });
    if (user) {
      return res.json({ message: "user already exist" });
    }
    const password = await bcrypt.hash(pass_word, 4);
    console.log(password);

    Users.create({ username, password })
      .then(() => {
        const token = jwt.sign({ username }, process.env.PRIVATE_KEY, {
          expiresIn: 60 * 60,
        });

        res.json({ status: "success", username: username, token: token });
      })
      .catch((errro) => {
        res.json({ status: "failed to register1" });
      });
  } catch (error) {
    res.json({ status: "failed to register2", error });
  }
});

//sign in request
app.post("/api/login", (req, res) => {
  const { username, pass_word } = req.body;
  console.log("hi");
  const user = Users.findOne({ username })
    .then((data) => {
      let pass_match = bcrypt.compare(pass_word, data.password);
      if (pass_match) {
        const token = jwt.sign({ username }, process.env.PRIVATE_KEY, {
          expiresIn: 60 * 60,
        });
        res.json({
          message: "successfully logged in",
          username: data.username,
          token: token,
        });
      }
    })
    .catch((error) => {
      res.json({
        status: "fsiled",
        message: "either username or password is incorrect",
      });
    });
});

// add story request

app.post("/api/addStory", async (req, res) => {
  const {user_name} = req.body;
  try {
    const story = await Stories.create({user_name});

    res.json(story._id);
  } catch (error) {
    res.json({ status: "error occured" });
  }
});

//adding slide to database

app.post("/api/addSlide", (req, res) => {
  const { heading, description, image_url, categories, story_id } = req.body;
  const likes = 0;
  const bookmarks = false;
  const isLiked = fasle;
  Slides.create({
    heading,
    description,
    image_url,
    categories,
    story_id,
    bookmarks,
    likes,
   
  })
    .then((data) => {
      console.log(data.story_id);
      res.json({ status: "success", data: data });
    })
    .catch((err) => {
      res.json({ status: "failed", error: err });
    });
});

// adding bookmarks

app.post('/api/bookmarks', async (req, res) => {
  const { userId, slideId } = req.body;

  try {
    const existingBookmark = await BookmarkedSlides.findOne({ userId, slideId });
    console.log(existingBookmark)
   
    if (existingBookmark) {
    
      await BookmarkedSlides.deleteOne({ userId, slideId }); // Unbookmark slide
      res.json({ success: true, message: 'Slide unbookmarked' });
    } else {
      const bookmark = new BookmarkedSlides({ userId, slideId });
      await bookmark.save(); // Bookmark slide
      // res.json(await BookmarkedSlides.find());
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//edit likes
app.patch("/api/likes", async (req, res) => {
  const { id , likes} = req.body;
  try {
    const updated = await Slides.findById(id);
    updated.likes = likes;
    // console.log(upvote,updated.upvotes)
    const updatedProduct = await updated.save();
    return res.json({
      likes: updatedProduct.likes,
      message: "success",
      name: updatedProduct.heading,
    });
  } catch (error) {
    res.json("error");
  }
});

// edit products
app.patch("/api/edit-products", async (req, res) => {
  const { _id, heading, description, image_url, category } = req.body;
  try {
    const Slide = await Slides.findById(_id);
    Slide.heading = heading;
    Slide.description = description;
    Slide.image_url = image_url;
    Slide.category = category;
    const updatedproduct = await Slide.save()
      .then(() => {
        console.log("yeahoo");
        res.json({ status: "success" });
      })
      .catch((err) => console.log("error dont worry"));
  } catch (error) {
    res.json("error");
  }
});

// server creation
app.listen(process.env.PORT, () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("server running on port :" + process.env.PORT);
    })
    .catch((error) => {
      console.log(error);
    });
});
