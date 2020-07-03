var express = require('express');
var router = express.Router()

router.get('/login',(req,res) => {
    res.send('login route');
})

router.get('/signup',(req,res)=>{
    res.send('signup route');
})

module.exports = router;