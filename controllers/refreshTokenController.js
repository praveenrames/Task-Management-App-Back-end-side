import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const RefreshTokenController = (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(401); // Unauthorized
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;

    const foundUser = User.findOne({ refreshToken }).exec();
    if(!foundUser) return res.sendStatus(403); //Forbidden

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if(err || foundUser.email !== decoded.email) return res.sendStatus(403);
        const accessToken = jwt.sign(
            {'email' : decoded.email},
            '' + process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '15m'}
        );
        res.json({ accessToken })
    })
};

export default RefreshTokenController;