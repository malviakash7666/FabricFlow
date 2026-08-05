const rateLimitWindow = 15 * 60 * 1000; // 15 minutes
const maxRequests = 100; // max requests per IP in the window
const ipRequests = new Map();

export const aiRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();

  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, { count: 1, resetTime: now + rateLimitWindow });
    return next();
  }

  const rateData = ipRequests.get(ip);

  // If window has passed, reset count and resetTime
  if (now > rateData.resetTime) {
    rateData.count = 1;
    rateData.resetTime = now + rateLimitWindow;
    return next();
  }

  // If request limit exceeded
  if (rateData.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: "Too many requests to the AI Assistant. Please try again in 15 minutes.",
    });
  }

  rateData.count++;
  next();
};
