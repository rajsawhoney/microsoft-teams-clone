const users = new Map();

const addUser = (socketId, userId) => {
  console.log("ADDing user...");
  const userExist = users.forEach((user) => user.userId === userId);
  if (userExist !== -1) {
    //i.e user exist
    console.log("Total users:", users);

    return { error: "User already exists!!!" };
  }
  users.set({ socketId: socketId, userId: userId });
  console.log("Total users:", users);
};

const removeUser = (userId) => {
  const index = users.find((user) => user.userId === userId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (useId) => users.find((user) => user.userId === userId);

const getAllUsers = () => users;

module.exports = { addUser, removeUser, getUser, getAllUsers };
