const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const jimp = require('jimp');
const uuid = require('uuid');
const multer = require('multer');
const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter (req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({ message: 'File type not allowed'}, false);
        }
    },
}

exports.addStore = (req, res) => res.render('editStore', { title: 'Add Store' });

exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
    const store = await (new Store(req.body)).save();

    req.flash('success', `Successfully creted ${store.name}`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
    const stores = await Store.find();
    res.render('stores', { title: 'Stores', stores });
}

const confirmOwner = (store, user) => {
    if(!store || !user || !store.author.equals(user._id)) {
        throw Error('You must own a store in order to edit it!')
    }
}

exports.editStore = async (req, res) => {
    const store = await Store.findOne({ _id: req.params.id });
    confirmOwner(store, req.user);

    res.render('editStore', { title: `Edit Store ${store.name}`,  store});
}

exports.updateStore = async (req, res) => {
    req.body.location.type = 'Point';
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, //returns the newly updated store
        runValidators: true        
    }).exec();

    req.flash('success', `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View Store </a>`);
    res.redirect(`/stores/${store._id}/edit`);
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    if(!req.file) { return next(); }

    const { mimetype, buffer }  = req.file;  
    const extension = mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    
    const photo = await jimp.read(buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    next();
}

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({ slug: req.params.slug }).populate('author');
    if(!store) { return next(); }

    res.render('store', { store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
    const { tag } = req.params;
    const tagQuery = tag || { $exists: true };

    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

    res.render('tag', { tags, title: 'Tags', tag, stores });
}

exports.searchStores  = async (req, res) => {
    const stores = await Store
    .find({
        $text: {
            $search: req.query.q
        } 
    }, {
        score: { $meta: 'textScore' }
    })
    .sort({
        score: { $meta: 'textScore' }
    }).limit(5);

    res.json(stores);
}