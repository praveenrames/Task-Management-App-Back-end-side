import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import 'path';
import nodemailer from 'nodemailer';

import User from '../models/User.js';

dotenv.config();

const maxAge = 168 * 60 * 60;

         // CREATE user for registration

const signup = async (req, res) => {

    try {
        const { firstName, lastName, email, password } = req.body;

        if(!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const duplicate = await User.findOne({ email: email });
        if(duplicate) {
            return res.sendStatus(409);
        }
          const hashedpwd = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedpwd,
        });

        if(req.file){
            user.userImage = req.file.path;
        } else {
            user.userImage = './default.svg';
        }

        const accessToken = jwt.sign(
            { user: user._id },
            '' + process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '7d'}
        );

        res.cookie('jwt', accessToken, {
            maxAge: maxAge * 1000,
            httpOnly: true,
        });

        user.save();

        if(user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userImage: user.userImage,
                token: accessToken,
            });
        } else {
            res.sendStatus(400);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

       //  User authentication or LOGIN

const authenticateUser = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.sendStatus(400).json({ message: 'All fields are required. '});
    }

    const foundUser = await User.findOne({ email: email });
    if(!foundUser) {
        return res.sendStatus(404);
    }

    const matchPwd = await bcrypt.compare(password, foundUser.password);

    if(matchPwd) {
        const accessToken = jwt.sign(
            { user: foundUser._id },
            '' + process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('jwt', accessToken, {
            maxAge: maxAge * 1000,
            httpOnly: true,
        });

        res.status(200).json({
            _id: foundUser._id,
            email: foundUser.email,
            token: accessToken,
        });
    } else {
        res.sendStatus(401);
    }
};

     // Forgot Password 

const forgotPassword = async (req, res) => {
    const { email } = req.body;
try {
    
    let user = await User.findOne({ email: email });
    if(!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const generatedOTP = () => {
        const characters = '0123456789';
        return Array.from({ length: 6 },
            () => characters[Math.floor(Math.random() * characters.length)]
        ).join('');
    };

    const OTP = generatedOTP();
    user.resetPasswordOtp = OTP;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:process.env.USER_MAILER,
            pass:process.env.PASS_MAILER,
        }
    });
    const mailOptions = {
        from: 'praveen123@gmail.com',
        to: user.email,
        subject: 'Password Reset',
        html: `
              <p>Dear${user.firstName} ${user.lastName},</P>
              <p>we received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></P>
              <p>Please Click the following link to reset your password:</P>
              <a href='http://localhost:5173/reset-password'>Reset Password</a>
              <p>Thank You,</P>
            `,
    };

    await transporter.sendMail(mailOptions);

} catch (error) {
    console.log(error);
    res.status(500).json({ message:'Internal server error'})
    }
};

    // GET User

const reqUser = async (req, res) => {

    try {
        
        const id = req.params['id'];
        if(!id) {
            return res.status(400).json({ message: 'User ID not found'})
        }
        const user = await User.findById(id);
        res.json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userImage: user.userImage,
            password: user.password,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

     // CreateDemoUser

const createDemoUser = async (req, res) => {
     
    const demoEmail = `demo${Math.random().toString(36).substr(2,9)}@email.com`

    const demoUser = {
        firstName: 'Demo',
        lastName: 'User',
        email: demoEmail,
        password: 'demo',
    }

    const duplicate = await User.findOne({ email: demoUser.email });

    if(duplicate) {
        return res.sendStatus(409);
    }

    const hashedpwd = await bcrypt.hash(demoUser.password, 10);

    try {
        const user = await User.create({
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            email: demoUser.email,
            password: hashedpwd,
            userImage: './default.svg',
        });

        const accessToken = jwt.sign(
            { user: user._id },
            '' + process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '1d'}
        )

        res.cookie('jwt', accessToken, {
            maxAge: maxAge * 1000,
            httpOnly: true,
        })

        user.save()

        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userImage: user.userImage,
            token: accessToken,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

      // EditUser

const editUser = async (req, res) => {

    const {email, firstName, lastName,} = req.body;
    
    let updatedUser = {
        email,
        firstName,
        lastName,
        userImage: req.file?.path.repla('frontend\\public\\', './'),
    };
    console.log(`req.file: ${updatedUser.userImage}`);
    console.log(req.file);
    try {
         const user = await User.findByIdAndUpdate(req.params.id, updatedUser, {
            new: true,
         });

         if(!user) {
            return res.status(404).json({ message: 'User not found.'});
         }

         res.status(200).json({ message: 'User updated.', user });
    } catch (error) {
        res.status(500).json({
            error: 'Edit unsuccessful, please try again.',
            message: error.message,
        });
    }
};

        // Update Password 

const updatePassword = async (req, res) => {

    const { oldPassword, newPassword } = req.body;
    const id = req.params.id;

    const foundUser = await User.findOne({_id: id});
    if(!foundUser) {
        return res.status(404).json({ message: 'User not found. '});
    }

    const matchPwd = await bcrypt.compare(oldPassword, foundUser.password);

    if(!matchPwd) {
        return res.status(401).json({ message: 'Old password is incorrect. '});
    }

    const hashedPwd = await bcrypt.hash(newPassword, 10);

    foundUser.password = hashedPwd;

    await foundUser.save();
    res.status(200).json({ message: 'Password updated.',
        foundUser,
    });
};

const UserController ={
    signup,
    authenticateUser,
    forgotPassword,
    reqUser,
    createDemoUser,
    editUser,
    updatePassword,
}

export default UserController;