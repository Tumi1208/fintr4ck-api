// Route nhỏ để kiểm tra server còn sống không

import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

export default router;