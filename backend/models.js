const mongoose = require('mongoose')
const { Schema } = mongoose

const MapSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

const ProjectSchema = new Schema({
    cid: {
        type: Number,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    canvas: {
        type: String,
        required: true
    }
});

const AccountSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// mongoose.model(model_name, model_schema, collection)
const Map = mongoose.model('Map', MapSchema, "maps");
const Project = mongoose.model('Project', ProjectSchema, "projects")
const Account = mongoose.model('Account', AccountSchema, "accounts")

module.exports = {
    Map,
    Project,
    Account
}