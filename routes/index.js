const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');
const { addStore, createStore, getStores, editStore, 
    updateStore, upload, resize, getStoreBySlug, 
    getStoresByTag } = require('../controllers/storeController');
const { loginForm, registerForm, validateRegister, register } = require('../controllers/userController');
const { login } = require('../controllers/authController');

router.get('/', catchErrors(getStores));
router.get('/stores', catchErrors(getStores));
router.get('/stores/:id/edit', catchErrors(editStore));


router.get('/add', addStore);
router.post('/add', upload, catchErrors(resize), catchErrors(createStore));
router.post('/add/:id', upload, catchErrors(resize), catchErrors(updateStore));

router.get('/store/:slug', catchErrors(getStoreBySlug));

router.get('/tags', catchErrors(getStoresByTag));
router.get('/tags/:tag', catchErrors(getStoresByTag));

router.get('/login', loginForm);
router.get('/register', registerForm);
router.post('/register', validateRegister, register, login);

module.exports = router;
