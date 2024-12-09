const protect = require('../middleware/authMiddleware');
const {createChats, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup} = require('../controllers/chatControllers')

const Router = require('express').Router();

    Router.route('/').post(protect,createChats).get(protect,fetchChats);
    Router.route('/group').post(protect,createGroupChat);
    Router.route('/rename').put(protect,renameGroup);
    Router.route('/removeFromGroup').put(protect,removeFromGroup);
    Router.route('/addToGroup').put(protect,addToGroup);


module.exports = Router;