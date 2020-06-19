const express = require('express');
const router = express.Router();

const users = require('./users')

router.use('/users',isLoggedIn, users)

function isLoggedIn(req, res, next){
	
	// if('OPTIONS' === req.method){
	// 	return corsHandler(req, res, next);
	// }

	// if(!req.headers.userId || !req.header.role){
	// 	return res.status(500).json({
	// 		message: 'Please login'
	// 	})
	// }

	next();
}

module.exports = router