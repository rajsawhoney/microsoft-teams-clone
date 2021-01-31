import React from "react";
import axios from "axios";
import { Edit, Delete } from "@material-ui/icons";
import NewEditRelease from "./NewEditRelease";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const ReleaseList = ({ releases, team }) => {
  const classes = useStyles();
  //   const handleDelete = (_id) => {
  //     if (window.confirm("Are you sure to delete this release??"))
  //       axios
  //         .delete(`http://127.0.0.1:8000/release/${_id}`)
  //         .then((res) => {
  //           team.releases = team.releases.filter((ft) => ft._id !== res.data._id);
  //           let newList = list.map((tm) => {
  //             if (tm.name === team.name) return { ...team };
  //             else return { ...tm };
  //           });
  //           setList([...newList]);
  //         })
  //         .catch((err) => console.log(err.message));
  //   };

  return (
    <div className="releases__list  ">
      <TableContainer component={Paper}>
        <NewEditRelease
          modalOpener="Create Release"
          isEditForm={false}
          team={team}
        />
        <Table
          className={classes.table}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              <TableCell>S.N</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>BotName</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {releases?.map((row, ind) => (
              <TableRow key={row._id}>
                <TableCell component="th" scope="row">
                  {ind + 1}
                </TableCell>
                <TableCell
                  style={{ textAlign: "center", width: "20%" }}
                  align="right"
                >
                  {row.name}
                </TableCell>
                <TableCell
                  style={{ textAlign: "center", width: "20%" }}
                  align="right"
                >
                  {row.botName}
                </TableCell>
                <TableCell>
                  <NewEditRelease
                    modalOpener={<Edit style={{ color: "blue" }} />}
                    isEditForm={true}
                    team={team}
                    release={row}
                  />
                </TableCell>
                <TableCell>
                  <Delete
                    style={{
                      color: "red",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                    // onClick={() => handleDelete(row._id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!releases.length && (
          <h3
            style={{
              textAlign: "center",
              color: "chocolate",
              padding: "5px 10px",
            }}
          >
            There is no any releases associated with this team so far. Try
            creating one now.
          </h3>
        )}
      </TableContainer>
    </div>
  );
};

export default ReleaseList;
