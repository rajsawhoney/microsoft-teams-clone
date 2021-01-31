import axios from "axios";

class TeamAdapter {
  constructor() {
    this.vendor = axios;
  }

  featchFeatures = (team) => {
    return axios
      .get(`http://127.0.0.1:8000/features/${team}`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log("Got err in fetching releases:", err.message);
      });
  };
  featchReleases = async (team) => {
    return axios
      .get(`http://127.0.0.1:8000/releases/${team}`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log("Got err in fetching releases:", err.message);
      });
  };

  toTeam = async (teams) => {
    return await teams.map((team) => {
      const getF = async () => await this.featchFeatures(team);
      const getR = async () =>
        await this.featchReleases(team).then((res) => res);
      return new Team({
        ...team,
        features: getF(),
        releases: getR(),
      });
    });
  };
}

class Team {
  constructor(team) {
    this._id = team._id;
    this.name = team.name;
    this.description = team.description;
    this.features = team.features;
    this.releases = team.releases;
  }
  updateTeamName = (newName) => {
    this.name = newName;
  };
  updateFeature = (id, newFeature) => {
    this.features.map((feature) => {
      if (feature._id === id) return { ...newFeature };
      else return feature;
    });
  };
}

export default TeamAdapter;
// const featchReleases = async (team) => {
//   return axios
//     .get(`http://127.0.0.1:8000/releases/${team}`)
//     .then((res) => {
//       return res;
//     })
//     .catch((err) => {
//       console.log("Got err in fetching releases:", err.message);
//     });
// };

// const featchFeatures = async (team) => {
//   return axios
//     .get(`http://127.0.0.1:8000/features/${team}`)
//     .then((res) => {
//       return res;
//     })
//     .catch((err) => {
//       console.log("Got err in fetching releases:", err.message);
//     });
// };

// export const MyAdapter = async (teams) => {
//   let team_list = [];
//   teams.map(async (team) => {
//     team_list.push({
//       ...team,
//       features: await featchFeatures(team.name).then((fet) => fet.data),
//       releases: await featchReleases(team.name).then((rel) => rel.data),
//     });
//   });
//   console.log("Returning value:", team_list);
//   return team_list;
// };
