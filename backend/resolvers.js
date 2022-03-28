const { Map, Project, Account } = require('./models')

const resolvers = {
    Query: {
      // query for map with name
      map: (root, args, context, info) => {
        return Map.findOne({name : args.name})
          .then (map => {
            return map;
        })
        .catch (err => {
          console.error(err);
        })
      },
      // query for all maps
      maps: (root, args, context, info) => { 
        return Map.find()
          .then ((data) => {
            return data;
        })
          .catch (err => {
            console.error(err);
        })
      },
      // query for project by id
      project: (root, args, context, info) => {
        return Project.findOne({cid : args.cid})
          .then (project => {
            return project;
        })
        .catch (err => {
          console.error(err);
        })
      },

      // query for all projects
      projects: (root, args, context, info) => { 
        return Project.find()
          .then ((data) => {
            return data;
        })
          .catch (err => {
            console.error(err);
        })
      },
      // query for account by username
      account: (root, args, context, info) => {
        return Account.findOne({username : args.username})
          .then (account => {
            return account;
        })
        .catch (err => {
          console.error(err);
        })
      },

      // query for all accounts
      accounts: (root, args, context, info) => { 
        return Account.find()
          .then ((data) => {
            return data;
        })
          .catch (err => {
            console.error(err);
        })
      }
    },

    Mutation: {
      // save a new account
      addAccount: (root, args, context, info) => {
        const {username, password} = args;
        const account = new Account({
          username,
          password
        });
        return account.save()
          .then(result => {
            return { ...result._doc}
          })
          .catch (err => {
            console.error(err);
          })
      },
      // save a new project
      saveProject: (root, args, context, info) => {
        const {cid, author, canvas} = args;
        const project = new Project({
          cid,
          author,
          canvas
        });
        return project.save()
          .then(result => {
            return { ...result._doc}
          })
          .catch (err => {
            console.error(err);
          })
      },
      // update a project
      updateProject: (root, args, context, info) => {
        Project.findOne({cid: args.cid})
          .then(proj => {
            if (!proj){
              throw new Error("couldn't find proj with cid ${args.cid}")
            }
            proj.canvas = args.canvas;
            console.log(proj);
            return proj.save()
              .then(result => {
                return { ...result._doc}
              })
              .catch(err => {
                console.error(err);
              })
          })
          .catch (err => {
            console.error(err);
          })
      }
    }
  };

module.exports = resolvers;