const express = require('express');
const router = express.Router();

const Subject = require('../models/subject');

router.get('/', (req, res, next) => {
  Subject.find()
    .then(subjects => res.json(subjects))
    .catch(next);
});

module.exports = router;