import * as type from "../actions/accounts/types";

import { toast } from "react-toastify";

const initialState = {
  user_profiles: [],
  my_profile: {},
  partner_profile: {},
  isAuthenticated: false,
  isLoading: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case type.LOGIN:
      toast.success(`👍 Login Success!`);
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case type.LOGOUT:
      return {
        my_profile: {},
        isAuthenticated: false,
        isLoading: false,
      };

    case type.AUTH_STATUS:
      return {
        user: action.payload.user,
        isAuthenticated: action.payload.status,
        isLoading: false,
      };

    case type.CREATE_PROFILE:
      if (action.payload.isOldUser) {
        toast.success(
          `💯👌 Successfully LoggedIn! Welcome back to Microsoft Teams Clone.`
        );
      } else {
        toast.success(
          `💯👌 Successfully registered! Welcome to Microsoft Teams Clone.`
        );
      }
      return {
        ...state,
        user_profiles: [...state.user_profiles],
      };

    case type.RETREIVE_PROFILES:
      return {
        ...state,
        user_profiles: action.payload,
      };

    case type.SET_MYPROFILE:
      return {
        ...state,
        my_profile: action.payload,
      };

    case type.SET_PARTNERPROFILE:
      return {
        ...state,
        partner_profile: action.payload,
      };

    case type.SET_PROFILE_PIC:
      if (action.payload.isUploaded) {
        toast.success(`💯👌 ${action.payload.message}`);
        return {
          ...state,
          my_profile: {
            ...state.my_profile,
            profile_pic: action.payload.newImageUrl,
          },
        };
      } else {
        toast.error(`😞 ${action.payload.message}`);
      }
      return state;

    case type.UPDATE_DISP_NAME:
      if (action.payload.isUpdated) {
        toast.success(`👍 ${action.payload.message}`);
        state.my_profile.displayName = action.payload?.new_name;
      } else {
        toast.error(`😞 ${action.payload.message}`);
      }
      return state;

    case type.SET_LAST_MESSAGE:
      state.user_profiles.filter((ite) => {
        if (ite.userId === action.payload.uid)
         return ite.last_message = action.payload.message;
      });
      return {
        ...state,
      };

    case type.UPDATE_STATUS:
      if (action.payload.isUpdated) {
        toast.success(`👍 ${action.payload.message}`);
        state.my_profile.about_me = action.payload?.new_status;
      } else {
        toast.error(`😞 ${action.payload.message}`);
      }

      return state;

    default:
      return state;
  }
};
