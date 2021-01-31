import { combineReducers } from "redux";
import accounts from "./reducers/accounts";
import chats from "./reducers/chats";
import socket from "./reducers/socket";
import api from "./reducers/api-tests";
const reducers = combineReducers({
  accounts: accounts,
  chats: chats,
  socket: socket,
  api: api,
});

export default reducers;
