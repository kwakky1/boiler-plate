const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()
const port = 5000

const { User } = require('./model/User')

const { auth } = require('./middleware/auth')

const config = require('./config/key')


// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:true }));
// application/json
app.use(bodyParser.json());

app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=> console.log('MongoDB Connected...'))
    .catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api/user/register', (req, res) => {
    // 회원 가입 할때 필요한 정보들을 client 에서 가져오면
    // 그것들을 클라이언트ㅔ
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err })
        return res.status(200).json({
                success: true
        })


    })
})

app.post('/api/user/login',(req, res) => {

    // 이메일을 데이터베이스에서 찾는다 - 비밀번호까지 맞는지 확인 - 토큰 생성
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
        })

        user.generateToken((err, user) => {
            if(err) return res.status(400).send(err)
            // 토큰을 저장한다. 쿠키, 로컬스토리지, 세션 여러가지 저장 장소가 있다.
            res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user._id })

        })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        _id : req._id,
        isAdmin : req.user.role === 0,
        isAuth : true,
        email : req.user.email,
        name : req.user.name,
        lastname : req.user.lastname,
        role : req.user.role,
        image : req.user.image
    })
})

app.get('/api/users/logout', auth, ( req, res) => {
    User.findOneAndUpdate({ _id: req.user._id},
        {toKen: ""}
        ,(err, user) => {
        if(err) return res.json({ success : false, err });
        return res.status(200).send({
            success : true
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})