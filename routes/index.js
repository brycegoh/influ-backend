const express = require('express');
const router = express.Router();

const users = require('./users')

router.use('/users', users)

// function isLoggedIn(req, res, next){
	
// 	if('OPTIONS' === req.method){
// 		return corsHandler(req, res, next);
// 	}

// 	if(!req.user){
// 		return res.status(500).json({
// 			message: 'Please login'
// 		})
// 	}

// 	next();
// }

module.exports = router