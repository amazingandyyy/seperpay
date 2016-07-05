'use strict';

var mongoose = require('mongoose');
var Project;
var projestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        default: 'https://scontent-sjc2-1.xx.fbcdn.net/v/t1.0-9/13413712_103705896723872_7894474241164931793_n.jpg?oh=2ce21391abbc9fb3b29f2f2d83e630ba&oe=580C64B6'
    },
    pitch:{
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    author: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    source: {
        type: String
    },
    displayUrl: {
        type: String
    },
    public: {
        type: Boolean,
        default: false
    },
    categories: [],
    tags: [],
    technics: [],
    liker: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // evaluation: {
    //     design: [{
    //         min: 1,
    //         max: 5,
    //         user: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: 'User'
    //         }
    //     }],
    //     innovative: [{
    //         min: 1,
    //         max: 5,
    //         user: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: 'User'
    //         }
    //     }],
    //     useful: [{
    //         min: 1,
    //         max: 5,
    //         user: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: 'User'
    //         }
    //     }]
    // },
    interested: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

projestSchema.statics.createOne = function(projectObj, cb) {
    console.log('new projectObj: ', projectObj);
    this.create(projectObj.projectInfo, (err, data) => {
        if (err) return cb(err);
        this.findOne({
            _id: data._id
        }, (err, project)=>{
            if (err || !project) return cb(err);
            project.author.push(projectObj.author)
            project.save((err, project)=>{
                if (err) return cb(err);
                cb(null, project);
            });
        })
    });
};

Project = mongoose.model('Project', projestSchema);

module.exports = Project;
