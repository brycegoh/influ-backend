const mongoose = require('mongoose');

const projectsSchema = mongoose.Schema({
    projectTitle: {
        type: String,
        required: true,
        unique: true
    },
    targetClicks: {
        type: Number,
        required: true,
        unique: true,
        trim: true,
        minlength: 5
    },
    affliateLink: {
        type: String,
        required: true,
        unique: true
    },
},{
    timestamps: true
});

const projects = mongoose.model("projects", projectsSchema);

module.exports = projects;