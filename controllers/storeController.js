const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.addStore = (req, res) => res.render('editStore', { title: 'Add Store' });

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully creted ${store.name}`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
    const stores = await Store.find();
    res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
    const store = await Store.findOne({ _id: req.params.id });
    res.render('editStore', { title: `Edit Store ${store.name}`,  store});
}

exports.updateStore = async (req, res) => {
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, //returns the newly updated store
        runValidators: true        
    }).exec();

    req.flash('success', `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View Store </a>`);
    res.redirect(`/stores/${store._id}/edit`);
}