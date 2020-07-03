const express = require('express');
const app = express();
const router = express.Router()

const PORT = 5000;

//routers
var auth = require('./routes/auth');

//calls
app.get('/', (req,res) => {
    res.send('hello world');
})

app.use('/auth',auth);

app.get('*', function(req, res){
    res.send('Oops invalid URL.');
});

app.listen(PORT,
    ()=> console.log(`Server running on ${PORT}`)
)