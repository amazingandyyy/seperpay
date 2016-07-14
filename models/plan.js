'use strict';

var mongoose = require('mongoose');
var Plan;
var planSchema = new mongoose.Schema({
    data: {
        type: Object
    },
    creator: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

planSchema.statics.saveSinglePlan = function(data, cb) {
    // console.log('new planObj in model: ', data)
    this.create(data.planDetails, (err, createdPlan) => {
        if (err) return cb(err)
        this.findOne({
            _id: createdPlan._id
        }, (err, dbPlan) => {
            if (err || !dbPlan) return cb(err)
            dbPlan.data = data.planDetails
            dbPlan.creator.push(data.creator._id)
            dbPlan.save((err, savedPlan) => {
                if (err) return cb(err);
                // create a new successfully
                // console.log('savedPlan: ', savedPlan)
                mongoose.model('User').findById(data.creator._id, (err, dbUser) => {
                    if (err) return cb(err);
                    // console.log('dbUser: ', dbUser);
                    dbUser.plans.push(savedPlan._id)
                    dbUser.save((err, savedUser) => {
                        if (err) {
                            console.log('err when save user after updating profilePhoto: ', err);
                            return cb(err)
                        }
                        cb(null, {savedPlan, savedUser})
                    });
                })
            })
        })
    })
}

Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
