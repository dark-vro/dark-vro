require("../settings");
const express = require('express');
const router = express.Router();
const passport = require('passport'),
   jwt = require('jsonwebtoken');

const {
   createActivationToken,
   getHashedPassword,
   randomText
} = require('../lib/functions');
const {
   checkEmail,
   checkOTP,
   checkUsername,
   addUser
} = require('../MongoDB/function');
const {
	User
} = require('../MongoDB/schema');
const {
   notAuthenticated
} = require('../lib/auth');
const sendEmail = require('../lib/email');

router.get('/login', notAuthenticated, (req, res) => {
   res.render('login', {
      layout: 'login'
   });
});

router.post('/login', async (req, res, next) => {
   passport.authenticate('local', {
      successRedirect: '/docs',
      failureRedirect: '/users/login',
      failureFlash: `<div class="alert alert-danger">
                  <button type="button" aria-hidden="true" class="close" data-dismiss="alert" aria-label="Close">
                    <i class="tim-icons icon-simple-remove"></i>
                  </button>
                  <span><b>Username or password not found</span>
                </div>`,
   })(req, res, next);
});

router.get('/verify', (req, res) => {
   res.render('verify', {
      layout: 'verify'
   });
});

router.post('/verify', async (req, res) => {
	let { otp } = req.body
	if (otp) {
		var check = await User.findOne({ otp: otp });
		if (check) {
			var userData = await User.findOne({ email: check.email });
            await userData.save();
            await User.findOneAndDelete({ otp: otp });
            res.redirect('/docs')
         }
    }
	if (!otp) {
      req.flash('error_msg', "Enter OTP!")
   }
   const {
            apikey,
            username,
            email,
            password,
    } = check

    let checkingOTP = await User.find({ otp: otp, id:  id});

   if (!checkingOTP) {
         req.flash('error_msg', "Invalid OTP")
      } else {
   
         let checking = await checkUsername(username);
         let checkingEmail = await checkEmail(email);
     if (!checking) {
            req.flash('error_msg', "Sorry. A user with that username already exists. Please use another username!")
            res.redirect("/users/signup");
         } else if (checkingEmail) {
            req.flash('error_msg', "Sorry. A user with that email address already exists. Please use another email!")
            res.redirect("/users/signup");
         } else {
            addUser(username, email, password, apikey);
            req.flash('success_msg', "Sign up successful. Please login to use our service.")
            res.redirect("/users/login");
         }
	}
	
});

router.get('/activation/', async (req, res) => {
   let id = req.query.id;
   if (!id) {
      req.flash('error_msg', "Invalid activation token")
      res.redirect("/users/register");
   }

   await jwt.verify(id, ACTIVATION_TOKEN_SECRET, async (err, user) => {
      if (err) {
         req.flash('error_msg', "Invalid activation token")
         res.redirect("/users/register");
      } else {
         const {
            apikey,
            username,
            email,
            password
         } = user
         let checking = await checkUsername(username);
         let checkingEmail = await checkEmail(email);
         if (checking) {
            req.flash('error_msg', "Sorry. A user with that username already exists. Please use another username!")
            res.redirect("/users/signup");
         } else if (checkingEmail) {
            req.flash('error_msg', "Sorry. A user with that email address already exists. Please use another email!")
            res.redirect("/users/signup");
         } else {
            addUser(username, email, password, apikey);
            req.flash('success_msg', "Sign up successful. Please login to use our service.")
            res.redirect("/users/login");
         }
      }
   });
});

router.get('/signup', notAuthenticated, (req, res) => {
   res.render('signup', {
      layout: 'signup'
   });
});

router.post('/signup', async (req, res) => {
   try {
           let digits = "0123456789"
           let otp_x = ""
           for (let i = 0; i < 6; i++) {
               otp_x += digits[Math.floor(Math.random() * 10)]
           }
      let {
         email,
         username,
         pass,
         pass2
      } = req.body;
      if (pass.length < 6 || pass2 < 6) {
         req.flash('error_msg', 'Password must contain at least 6 characters');
         return res.redirect('/users/signup');
      }
      if (pass === pass2) {
         let checking = await checkUsername(username);
         let checkingEmail = await checkEmail(email);
         if (checkingEmail) {
            req.flash('error_msg', 'A user with the same Email already exists');
            return res.redirect('/users/signup');
         }
         if (checking) {
            req.flash('error_msg', 'A user with the same Username already exists');
            return res.redirect('/users/signup');
         } else {
            
            let hashedPassword = getHashedPassword(pass);
            let apikey = randomText(10);
            const newUser = {
               apikey,
               username: username,
               email,
               password: hashedPassword
            }
            const activationToken = createActivationToken(newUser)
            const url = `https://${req.hostname}/users/activation?id=${activationToken}`
            await User({ otp: otp_x, username: username, email: email, password: hashedPassword, apikey:apikey}).save();
            await sendEmail.inboxGmailRegist(email, otp_x,url);
            req.flash('success_msg', 'You are now registered, please check your email to enter the otp');
            return res.redirect('/users/verify');
         }
      } else {
         req.flash('error_msg', 'Password and Password confirmation are not the same');
         return res.redirect('/users/signup');
      }
   } catch (err) {
      console.log(err);
   }
})

router.get('/logout', (req, res) => {
   req.logout();
   req.flash('success_msg', 'logout success');
   res.redirect('/users/login');
});

module.exports = router;