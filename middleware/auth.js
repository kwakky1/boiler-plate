const { User } = require('../model/User')


let auth = ( req, res, next ) => {
    // 클라이언트 쿠키에서 토큰을 가지고 온 후 - 토큰 복호화 - 유저가 있으면 true 아니면 false
    let token = req.cookies.x_auth;

    User.findByToken(token, (err, user) => {
        if(err) throw err
        if(!user) return res.json({ isAuth: false, error: true })
        req.token = token
        req.user = user
        next()
    })
}

module.exports = { auth };