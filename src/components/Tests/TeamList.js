import React, { useEffect } from "react";
import { connect } from "react-redux";
import ReleaseList from "./ReleaseList";
import FeatureList from "./FeatureList";
import "./TestForm.css";

const TeamList = ({ isLoading, list }) => {
  useEffect(() => {
    return () => {
      console.log("Your list:", list);
    };
  }, [isLoading, list]);
  return (
    <div>
      {isLoading ? (
        list.map((team) => (
          <table className="team_list" key={team._id}>
            <h3 style={{ textAlign: "center", marginBottom: "2px" }}>
              {team.name}
            </h3>
            <p style={{ textAlign: "center", marginTop: "2px" }}>
              {team.description}
            </p>
            <FeatureList features={team.features} team={team} />
            <br />
            <ReleaseList releases={team.releases} team={team} />
          </table>
        ))
      ) : (
        <h4>Loading Teams and its Features and Releases</h4>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.api.isLoading,
  list: state.api.list,
});

export default connect(mapStateToProps, null)(TeamList);
