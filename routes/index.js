const express = require('express');
const router = express.Router();

const users = require('./users')
const auth = require('./auth')

router.use('/api/users',isLoggedIn, users)

router.use('/api/auth', auth)

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