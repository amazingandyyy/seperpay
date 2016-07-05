var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Project = require('../models/project');

// GET All projects
router.get('/all', (req, res) => {
    Project.find({}, (err, projects) => {
        res.status(err ? 400 : 200).send(err || projects);
    });
});

// GET One project
// /api/projects/${projectId}
router.get('/:id', (req, res) => {
    Project.findById(req.params.id, (err, project) => {
        res.status(err ? 400 : 200).send(err || project);
    }).populate('author starred');
});
// Create One project
router.post('/', User.authMiddleware, (req, res) => {
    console.log('req.body: ', req.body);
    // console.log('req.user: ', req.user);
    var projectObj = {
        projectInfo: {
            title: req.body.title,
            pitch: req.body.pitch
        },
        author: req.user._id
    }
    Project.createOne(projectObj, (err, project) => {
        console.log('project: ', req.body);
        if(err) return res.status(400).send(err);
        var updateData = {
            projectId: project._id,
            currentUser: req.user._id
        }
        User.addProject(updateData, (err, user)=>{
            if(err) return res.status(400).send(err);
            var resData = {
                project: project,
                user: user
            }
            res.status(err ? 400 : 200).send(err || resData);
        })
    });
});
// Delete All projects
router.delete('/all', (req, res) => {
    Project.remove({}, (err, project) => {
        res.status(err ? 400 : 200).send(err || project);
    });
});
// Delete One project
router.delete('/:id', (req, res) => {
    Project.remove({
        _id: req.params.id
    }, (err, project) => {
        res.status(err ? 400 : 200).send(err || project);
    });
});
// PUT Event/like
router.get('/event/like', User.authMiddleware, (req, res) => {
    console.log('like event date: ', data);
        // if (req.user._id == req.body.currentUser) {
        //     User.eventFollow(req.data, (err, data) => {
        //         if (err) return console.log('err: ', err);
        //         console.log('data: ', data)
        //         res.status(err ? 400 : 200).send(err || data)
        //     })
        // }
    })

module.exports = router;
