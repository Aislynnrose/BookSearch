const {AuthenticationError} = require('apollo-server-express');
const { User} = require('../models');
const {signToken} = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (a,b, c) => {
      if(c.user){
        return await User.findOne({_id: c.user._id}).select('-__v -password');
      }
      throw new AuthenticationError('Incorrect username or password');
    
    } 
  },

  Mutation: {
    addUser: async (parent, object) => {
      const user = await User.create(object);
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, {email, password})=>{
      const user = await User.findOne({ email });
      
      if(!user) {
        throw new AuthenticationError('No user found with that username');
      }

      const actualPassword = await user.isCorrectPassword(password);

      if(!actualPassword){
        throw new AuthenticationError('Incorrect password');
      };

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (a, {bookData}, c)=>{
      if(c.user){
        return await User.findByIdAndUpdate({_id:c.user._id}, {$push: {savedBooks: bookData}}, {new:true})
      } 
      throw new AuthenticationError('Please login');
    },
    removeBook: async (a, {bookId}, c)=>{
      if(c.user){
        return await User.findOneAndUpdate({_id:c.user._id}, {$pull: {savedBooks: bookId}}, {new:true})
      } 
      throw new AuthenticationError('Please login');
    }
  }
};

module.exports = resolvers;

