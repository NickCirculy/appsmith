import { createImmerReducer } from "utils/ReducerUtils";
import {
  ReduxAction,
  ReduxActionTypes,
  UpdateCanvasPayload,
} from "@appsmith/constants/ReduxActionConstants";
import { MAIN_CONTAINER_WIDGET_ID } from "constants/WidgetConstants";
import { UpdateCanvasLayoutPayload } from "actions/controlActions";

const initialState: MainCanvasReduxState = {
  initialized: false,
  width: 0,
  height: 0,
  tabsWidth: 600,
  zoom: 0.8,
};

const mainCanvasReducer = createImmerReducer(initialState, {
  [ReduxActionTypes.INIT_CANVAS_LAYOUT]: (
    state: MainCanvasReduxState,
    action: ReduxAction<UpdateCanvasPayload>,
  ) => {
    const mainCanvas =
      action.payload.widgets &&
      action.payload.widgets[MAIN_CONTAINER_WIDGET_ID];

    state.width = mainCanvas?.rightColumn || state.width;
    state.zoom = 1;
    state.height = mainCanvas?.minHeight || state.height;
  },
  [ReduxActionTypes.UPDATE_CANVAS_LAYOUT]: (
    state: MainCanvasReduxState,
    action: ReduxAction<UpdateCanvasLayoutPayload>,
  ) => {
    state.width = action.payload.width || state.width;

    state.zoom = Number(Math.abs(state.width / window.screen.width).toFixed(3));
    // state.zoom = Number(localStorage.getItem("zoomLevel")) || 1;
    state.initialized = true;
  },
  [ReduxActionTypes.UPDATE_TABS_PANEL_WIDTH]: (
    state: MainCanvasReduxState,
    action: ReduxAction<{ width: number }>,
  ) => {
    state.tabsWidth = action.payload.width;
  },
});

export interface MainCanvasReduxState {
  width: number;
  height: number;
  initialized: boolean;
  tabsWidth: number;
  zoom: number;
}

export default mainCanvasReducer;
