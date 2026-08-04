import jwt from "jsonwebtoken";

/**
 * Generate Access Token
 * Expiry: 15 Minutes
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,

    process.env.ACCESS_TOKEN_SECRET,

    {
      expiresIn: "15m",
    },
  );
};

/**
 * Generate Refresh Token
 * Expiry: 7 Days
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,

    process.env.REFRESH_TOKEN_SECRET,

    {
      expiresIn: "7d",
    },
  );
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

/**
 * Cookie Options
 */

export const refreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction ? "none" : "lax",

    maxAge: 7 * 24 * 60 * 60 * 1000,

    path: "/",
  };
};
