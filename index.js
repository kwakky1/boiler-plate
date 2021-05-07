const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 5000

const { User } = require('./model/User')

const config = require('./config/key')

app.use(bodyParser.urlencoded({ extended:true }))

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=> console.log('MongoDB Connected...'))
    .catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/register', ((req, res) => {
    // 회원 가입 할때 필요한 정보들을 client 에서 가져오면
    // 그것들을 클라이언트ㅔ


    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
}))

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})