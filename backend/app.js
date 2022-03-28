const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const typeDefs = require('./schema')
const resolvers = require('./resolvers');

const server = new ApolloServer({
  cors: {
    origin: '*'
  },
  typeDefs,
  resolvers,
});

mongoose
  .connect("mongodb+srv://admin:XaViQOiidhZIFpvZ@project-csp.gidwb.mongodb.net/project-csp?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
  .then( () => {
      server.listen({port: process.env.PORT || 4000}, () =>{
      console.log('MongoDB connected successfully, server running on ${url}');
      // debugging to check collections in db
      mongoose.connection.db.listCollections().toArray(function (err, names) {
        console.log(names); // [{ name: 'dbname.myCollection' }]
      });
    })
  })
  .catch( (err) => {
    console.error('Error while connecting to MongoDB', err);
  })


