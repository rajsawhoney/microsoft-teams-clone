import React, { useState } from "react";
import { AddOutlined, KeyboardArrowDown, Cancel } from "@material-ui/icons";
import DatePicker from "react-date-picker";
import "./TestForm.css";

const AppleForm = () => {
  const [addComment, setAddComment] = useState(false);
  const [commentList, setCommentList] = useState([]);
  const [comment, setComment] = useState({
    username: "",
    phone: "",
    text: "",
    posted_on: new Date(),
  });

  const [phase, setPhase] = useState({
    name: "",
    comment: "",
    start_date: new Date(),
    end_date: new Date(),
  });
  const [phaseList, setPhaseList] = useState([]);

  const handleAddPhase = () => {
    setPhaseList([...phaseList, phase]);
    setPhase({
      name: "",
      comment: "",
      start_date: new Date(),
      end_date: new Date(),
    });
  };

  const handleCommentList = () => {
    setCommentList([...commentList, comment]);
    setComment({
      username: "",
      phone: "",
      text: "",
      posted_on: new Date(),
    });
  };

  const handleEditComment = (data) => {
    setComment(data);
    setAddComment(!addComment);
  };

  const handleCancelComment = (item) => {
    setCommentList(commentList.filter((cmt) => cmt.text !== item.text));
  };

  return (
    <>
      <div className="test__form__group">
        <input
          placeholder="phase name"
          value={phase.name}
          onChange={(e) => setPhase({ ...phase, name: e.target.value })}
        />
        <input
          placeholder="phase comment"
          value={phase.comment}
          onChange={(e) => setPhase({ ...phase, comment: e.target.value })}
        />
        <input
          placeholder="phase start date"
          value={phase.start_date}
          onChange={(e) => setPhase({ ...phase, start_date: e.target.value })}
        />
        <input
          placeholder="phase end date"
          value={phase.end_date}
          onChange={(e) => setPhase({ ...phase, end_date: e.target.value })}
        />
        <div className="comment__list">
          {commentList.map((item) => (
            <span key={item.posted_on}>
              <p onClick={() => handleEditComment(item)}>{item.text}</p>{" "}
              <Cancel onClick={() => handleCancelComment(item)} />
            </span>
          ))}
        </div>
        <p style={{ display: "inline-flex" }}>
          Add comment
          <KeyboardArrowDown
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => setAddComment(!addComment)}
          />
        </p>
        {addComment && (
          <div className="comment__form">
            <input
              placeholder="username"
              required
              value={comment.username}
              onChange={(e) =>
                setComment({ ...comment, username: e.target.value })
              }
            />
            <input
              required
              placeholder="your phone number"
              value={comment.phone}
              onChange={(e) =>
                setComment({ ...comment, phone: e.target.value })
              }
            />
            <input
              required
              placeholder="Your message here"
              value={comment.text}
              onChange={(e) => setComment({ ...comment, text: e.target.value })}
            />
            <DatePicker
              // showTimeSelect
              value={comment.posted_on}
              onChange={(date) => setComment({ ...comment, posted_on: date })}
            />

            <button onClick={handleCommentList}>
              Add <AddOutlined />
            </button>
          </div>
        )}
        <button onClick={handleAddPhase}>Add Phase</button>
      </div>
    </>
  );
};

export default AppleForm;
