const express = require('express');
const router = express.Router();

// @route   GET /api/test
// @desc    Test API
// @access  Public
router.get('/', (req, res) => {
    res.json({ message: "API is working" });
});

module.exports = router;
