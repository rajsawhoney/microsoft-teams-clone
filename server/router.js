const express = require("express");
const router = express.Router();
const Feature = require("./models/features");
const Release = require("./models/releases");
const Team = require("./models/teams");
const Joi = require("joi");

//teams list api
router.get("/teams", async (req, res) => {
  try {
    let teamList = await Team.find();
    return res.status(200).json(teamList);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//create new team api
router.post("/teams", async (req, res) => {
  const teamData = req.body;
  try {
    let new_team = new Team();
    new_team.name = teamData.name;
    new_team.description = teamData.description;
    let ins = await new_team.save();
    return res.status(201).json({
      data: ins,
      message: "New Team Created!",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//features list api
router.get("/features/:team", async (req, res) => {
  const team = req.params.team;
  try {
    const featuresList = await Feature.find({ team: team });
    return res.json(featuresList).status(200);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//create new feature api
router.post("/feature/:team", async (req, res) => {
  const featureData = req.body;
  try {
    let new_feature = new Feature();
    new_feature.name = featureData.name;
    new_feature.team = req.params.team;
    new_feature.platForm = featureData.platForm;
    new_feature.discProject = featureData.discProject;
    let ins = await new_feature.save();
    return res.status(201).json({
      data: ins,
      message: "New Feature Created!",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//update feature api
router.patch("/feature/:_id", async (req, res) => {
  const featureData = req.body;
  try {
    let featureIns = await Feature.findById(req.params._id);
    const { error } = await validateFeature(featureData);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (!featureIns)
      return res
        .status(404)
        .json({ message: "Feature with this ID doesn't exist in our DB!" });
    else {
      await Feature.findByIdAndUpdate(req.params._id, featureData, {
        useFindAndModify: false,
      });
      return res.status(202).json({
        data: await Feature.findById(req.params._id),
        message: "Feature Updated Successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
//delete feature
router.delete("/feature/:_id", (req, res) => {
  try {
    let featureIns = Feature.findById(req.params._id);
    if (featureIns) {
      Feature.findOneAndRemove({ _id: req.params._id });
      return res
        .status(203)
        .json({ message: "Feature Deleted!", _id: req.params._id });
    } else
      return res
        .status(404)
        .json({ message: "Feature with this ID doesn't exist in our DB!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//releases list api
router.get("/releases/:team", async (req, res) => {
  const team = req.params.team;
  try {
    const releasesList = await Release.find({ team: team });
    return res.json(releasesList).status(200);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//create new release api
router.post("/release/:team", async (req, res) => {
  const releaseData = req.body;
  try {
    let new_release = new Release();
    new_release.name = releaseData.name;
    new_release.team = req.params.team;
    new_release.phases = releaseData.phases;
    new_release.botName = releaseData.botName;
    let ins = await new_release.save();
    return res.status(201).json({
      data: ins,
      message: "New Release Created!",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//update release api
router.patch("/release/:_id", async (req, res) => {
  const releaseData = req.body;
  try {
    let releaseIns = await Release.findById(req.params._id);
    const { error } = await validateRelease(releaseData);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (!releaseIns)
      return res
        .status(404)
        .json({ message: "Release with this ID doesn't exist in our DB!" });
    else {
      await Release.findByIdAndUpdate(req.params._id, releaseData, {
        useFindAndModify: false,
      });
      return res.status(202).json({
        data: await Release.findById(req.params._id),
        message: "Release Updated Successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//delete feature
router.delete("/release/:_id", (req, res) => {
  try {
    let releaseIns = Release.findById(req.params._id);
    if (releaseIns) {
      Release.findOneAndRemove({ _id: req.params._id });
      return res
        .status(203)
        .json({ message: "Release Deleted!", _id: req.params._id });
    } else
      return res
        .status(404)
        .json({ message: "Release with this ID doesn't exist in our DB!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// JOI VALIDATION
const validateRelease = (feature) => {
  const validSchema = Joi.object({
    name: Joi.string().required().max(120),
    botName: Joi.string().required(),
    phases: Joi.array().required(),
  });
  return validSchema.validate(feature);
};

const validateFeature = (feature) => {
  const validSchema = Joi.object({
    name: Joi.string().required().max(120),
    platForm: Joi.string().required(),
    discProject: Joi.array().required(),
  });
  return validSchema.validate(feature);
};

module.exports = router;
