const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

const app = express();


app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


mongoose
  .connect(
    "mongodb://127.0.0.1:27017/project3"
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(
      "MongoDB connection error:",
      err.message
    );
  });



const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  refreshToken: {
    type: String,
    default: "",
  },
});

const User = mongoose.model(
  "User",
  UserSchema
);



const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  branch: {
    type: String,
    required: true,
  },

  contact: {
    type: Number,
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Student = mongoose.model(
  "Student",
  StudentSchema
);



const ACCESS_SECRET =
  "accesssecret123";

const REFRESH_SECRET =
  "refreshsecret123";


function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    ACCESS_SECRET,
    {
      expiresIn: "30s",
    }
  );
}



function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    REFRESH_SECRET,
    {
      expiresIn: "1min",
    }
  );
}



function authentication(
  req,
  res,
  next
) {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message:
        "Access Token Missing. Please Login.",
    });
  }


  const token =
    authHeader.split(" ")[1];


  if (!token) {
    return res.status(401).json({
      message:
        "Access Token Missing. Please Login.",
    });
  }

  jwt.verify(
    token,
    ACCESS_SECRET,
    (err, user) => {

      
      if (
        err &&
        err.name ===
          "TokenExpiredError"
      ) {
        return res.status(401).json({
          message:
            "Access Token Expired",
        });
      }

  
      if (err) {
        return res.status(403).json({
          message:
            "Invalid Access Token",
        });
      }

      req.user = user;

      next();
    }
  );
}



app.post(
  "/signup",
  async (req, res) => {
    try {

      const {
        name,
        email,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "All fields are required",
        });
      }

      const existingUser =
        await User.findOne({
          email,
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "User already exists",
        });
      }

      const hash =
        await bcrypt.hash(
          password,
          10
        );

      await User.create({
        name,
        email,
        password: hash,
        refreshToken: "",
      });

      return res.status(201).json({
        message:
          "Signup Successful",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);

// =========================
// LOGIN
// =========================

app.post(
  "/login",
  async (req, res) => {
    try {

      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "All fields are required",
        });
      }

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(401).json({
          message:
            "User not found",
        });
      }

      const match =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!match) {
        return res.status(401).json({
          message:
            "Wrong Password",
        });
      }

    
      const accessToken =
        generateAccessToken(user);

 
      const refreshToken =
        generateRefreshToken(user);

      user.refreshToken =
        refreshToken;

      await user.save();


      res.cookie(
        "refreshToken",
        refreshToken,
        {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          maxAge:
            5 * 60 * 1000,
        }
      );

      return res.json({
        message:
          "Login Success",
        accessToken,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);


app.post(
  "/student",
  authentication,
  async (req, res) => {

    try {

      const {
        name,
        branch,
        contact,
      } = req.body;

      if (
        !name ||
        !branch ||
        !contact
      ) {
        return res.status(400).json({
          message:
            "All fields are required",
        });
      }

      const student =
        await Student.create({
          name,
          branch,
          contact: Number(contact),
          user: req.user.id,
        });

      return res.status(201).json({
        message:
          "Student details saved successfully",
        student,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);



app.get(
  "/studentdata",
  authentication,
  async (req, res) => {

    try {

      const students =
        await Student.find({
          user: req.user.id,
        }).select(
          "name branch contact"
        );

      return res.json({
        students,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);



app.put(
  "/update",
  authentication,
  async (req, res) => {

    try {

      const { name } =
        req.body;

      if (
        !name ||
        !name.trim()
      ) {
        return res.status(400).json({
          message:
            "Name is required",
        });
      }

      const user =
        await User.findByIdAndUpdate(
          req.user.id,
          {
            name: name.trim(),
          },
          {
            new: true,
          }
        ).select(
          "-password -refreshToken"
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      return res.json({
        message:
          "Updated Successfully",
        user,
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);



app.post(
  "/logout",
  authentication,
  async (req, res) => {

    try {

      await User.findByIdAndUpdate(
        req.user.id,
        {
          refreshToken: "",
        }
      );

      res.clearCookie(
        "refreshToken"
      );

      return res.json({
        message:
          "Logout Successful",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);


app.delete(
  "/delete",
  authentication,
  async (req, res) => {

    try {

     
      await Student.deleteMany({
        user: req.user.id,
      });

      await User.findByIdAndDelete(
        req.user.id
      );


      res.clearCookie(
        "refreshToken"
      );

      return res.json({
        message:
          "Deleted Successfully",
      });

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server Error",
      });
    }
  }
);



app.listen(
  5000,
  () => {
    console.log(
      "Server running on port 5000"
    );
  }
);