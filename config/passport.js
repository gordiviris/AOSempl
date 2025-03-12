const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const AppUser = require("../models/AppUsers")

//Variable that simulates in our database
// const users = [{
//     id:1,
//     username:"testuser",
//     password:"password1234",
//     name:"Test User"
// }];

// module.exports = function(passport){
//     passport.use(
//         new LocalStrategy(async (username, password, done)=>{
//             const user = users.find(u => u.username === username);

//             //check for user
//             if(!user) return done(null, false, {message:"No user found"});

//             //Then check password
//             if(password !== user.password) return done(null,false, {message:"Incorrect password"});

//             //pass the checks
//             return done(null, user);
//         })
//     )};


module.exports = function (passport) {
    passport.use(
        new LocalStrategy({username:"username"}, async (username, password, done) => {
            

            try{
                const user = await AppUser.findOne({username});
                 //check for user
                if (!user) return done(null, false, { message: "No user found" });

                const isMatch = await bcrypt.compare(password, user.password);
                //Then check password
                if (!isMatch) return done(null, false, { message: "Incorrect password" });
                //pass the checks
                return done(null, user);

            }catch(err){
                return done(err);
            }   
        })
    );

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser(async (id, done) => {
        try{
            const user = await AppUser.findById(id)
            done(null, user);
        }catch(err){
            done(err)
        }  
    })
}