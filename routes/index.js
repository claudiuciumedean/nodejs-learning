const express = require('express');
const router = express.Router();
const { homePage, addStore, createStore, getStores } = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', homePage);
router.get('/add', addStore);
router.get('/stores', getStores);
router.post('/add', catchErrors(createStore));

module.exports = router;
