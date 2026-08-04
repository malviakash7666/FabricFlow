import bcrypt from "bcrypt";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  refreshTokenCookieOptions,
} from "../utils/token.js";

import db from "../database/models/index.js";

const { User } = db;

// =============================
// Register User
// =============================

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the details",
    });
  }

  const existingUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,

    email,

    password: hashedPassword,

    role: role || "buyer",
  });

  // Generate Tokens after registration

  const accessToken = generateAccessToken({
    id: user.id,

    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  // Store refresh token in database

  user.refreshToken = refreshToken;

  await user.save();

  // Store refresh token in cookie

  res
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions())
    .status(201)
    .json({
      success: true,

      message: "User registered successfully",

      accessToken,

      user: {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,
      },
    });
};

// =============================
// Login User
// =============================

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Please provide all the details",
    });
  }
  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const accessToken = generateAccessToken({
    id: user.id,

    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  // Save refresh token

  user.refreshToken = refreshToken;

  await user.save();
res
.cookie(
  "refreshToken",
  refreshToken,
  refreshTokenCookieOptions()
)
.status(200)
.json({

  success:true,

  message:"Login successful",

  accessToken,

  user:{
    id:user.id,
    name:user.name,
    email:user.email,
    role:user.role,
  }

});


};

// =============================
// Get Current User
// =============================

// =============================
// Refresh Access Token
// =============================

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  const user = await User.findOne({
    where: {
      refreshToken: token,
    },
  });

  if (!user) {
    return res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

  const decoded = verifyRefreshToken(token);

  const accessToken = generateAccessToken({
    id: decoded.id,

    role: user.role,
  });

  res.json({
    success: true,

    accessToken,
  });
};
export const getMe = async (req, res) => {
  const user = await User.findByPk(
    req.user.id,

    {
      attributes: ["id", "name", "email", "role"],
    },
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json({
    user,
  });
};

// =============================
// Logout User
// =============================

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const user = await User.findOne({
      where: {
        refreshToken,
      },
    });

    if (user) {
      user.refreshToken = null;

      await user.save();
    }
  }

  res.clearCookie("refreshToken", refreshTokenCookieOptions()).json({
    message: "Logout successful",
  });
};
