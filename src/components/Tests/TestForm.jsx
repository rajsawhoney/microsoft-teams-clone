import React, { useEffect } from "react";
import TeamList from "./TeamList";
import "./TestForm.css";
import { connect } from "react-redux";
import { fetchTeams } from "../../redux/actions/api-tests";

const TestForm = ({ fetchTeams, isLoading, list }) => {
  useEffect(() => {
    fetchTeams();
  }, [isLoading, fetchTeams]);
  return (
    <div className="test__form__container">
      <h1>Test your API here:</h1>
      <TeamList />
    </div>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.api.isLoading,
  list: state.api.list,
});

export default connect(mapStateToProps, { fetchTeams })(TestForm);
