import { AppsmithFunction, FieldType } from "../constants";
import {
  CLEAR_INTERVAL,
  CLEAR_STORE,
  CLOSE_MODAL,
  COPY_TO_CLIPBOARD,
  createMessage,
  DOWNLOAD,
  EXECUTE_A_QUERY,
  EXECUTE_JS_FUNCTION,
  GET_GEO_LOCATION,
  NAVIGATE_TO,
  NO_ACTION,
  OPEN_MODAL,
  POST_MESSAGE,
  REMOVE_VALUE,
  RESET_WIDGET,
  SET_INTERVAL,
  SHOW_MESSAGE,
  STOP_WATCH_GEO_LOCATION,
  STORE_VALUE,
  WATCH_GEO_LOCATION,
} from "@appsmith/constants/messages";
import { FieldGroupConfig } from "../types";

export const FIELD_GROUP_CONFIG: FieldGroupConfig = {
  [AppsmithFunction.none]: {
    label: createMessage(NO_ACTION),
    fields: [],
    defaultParams: "",
  },
  [AppsmithFunction.integration]: {
    label: createMessage(EXECUTE_A_QUERY),
    fields: [],
    children: [{ label: "", value: "" }],
    defaultParams: "",
  },
  [AppsmithFunction.jsFunction]: {
    label: createMessage(EXECUTE_JS_FUNCTION),
    value: AppsmithFunction.jsFunction,
    fields: [],
    children: [{ label: "", value: "" }],
    defaultParams: "",
  },
  [AppsmithFunction.navigateTo]: {
    label: createMessage(NAVIGATE_TO),
    fields: [
      FieldType.PAGE_NAME_AND_URL_TAB_SELECTOR_FIELD,
      /**
       * The second field is dependent on activeTabNavigateTo value
       * if PAGE_NAME then this field will be PAGE_SELECTOR_FIELD (default)
       * if URL then this field will be URL_FIELD
       **/
      FieldType.PAGE_SELECTOR_FIELD,
      FieldType.QUERY_PARAMS_FIELD,
      FieldType.NAVIGATION_TARGET_FIELD,
    ],
    defaultParams: `'', {}, 'SAME_WINDOW'`,
  },
  [AppsmithFunction.showAlert]: {
    label: createMessage(SHOW_MESSAGE),
    fields: [FieldType.ALERT_TEXT_FIELD, FieldType.ALERT_TYPE_SELECTOR_FIELD],
    defaultParams: `'', ''`,
  },
  [AppsmithFunction.showModal]: {
    label: createMessage(OPEN_MODAL),
    fields: [FieldType.SHOW_MODAL_FIELD],
    defaultParams: "",
  },
  [AppsmithFunction.closeModal]: {
    label: createMessage(CLOSE_MODAL),
    fields: [FieldType.CLOSE_MODAL_FIELD],
    defaultParams: "",
  },
  [AppsmithFunction.storeValue]: {
    label: createMessage(STORE_VALUE),
    fields: [FieldType.KEY_TEXT_FIELD, FieldType.VALUE_TEXT_FIELD],
    defaultParams: `'', ''`,
  },
  [AppsmithFunction.removeValue]: {
    label: createMessage(REMOVE_VALUE),
    fields: [FieldType.KEY_TEXT_FIELD],
    defaultParams: `''`,
  },
  [AppsmithFunction.clearStore]: {
    label: createMessage(CLEAR_STORE),
    fields: [],
    defaultParams: "",
  },
  [AppsmithFunction.download]: {
    label: createMessage(DOWNLOAD),
    fields: [
      FieldType.DOWNLOAD_DATA_FIELD,
      FieldType.DOWNLOAD_FILE_NAME_FIELD,
      FieldType.DOWNLOAD_FILE_TYPE_FIELD,
    ],
    defaultParams: `'', '', ''`,
  },
  [AppsmithFunction.copyToClipboard]: {
    label: createMessage(COPY_TO_CLIPBOARD),
    fields: [FieldType.COPY_TEXT_FIELD],
    defaultParams: `''`,
  },
  [AppsmithFunction.resetWidget]: {
    label: createMessage(RESET_WIDGET),
    fields: [FieldType.WIDGET_NAME_FIELD, FieldType.RESET_CHILDREN_FIELD],
    defaultParams: `"",true`,
  },
  [AppsmithFunction.setInterval]: {
    label: createMessage(SET_INTERVAL),
    fields: [
      FieldType.CALLBACK_FUNCTION_FIELD,
      FieldType.DELAY_FIELD,
      FieldType.ID_FIELD,
    ],
    defaultParams: `() => {
      // add code here
    }, 5000, ''`,
  },
  [AppsmithFunction.clearInterval]: {
    label: createMessage(CLEAR_INTERVAL),
    fields: [FieldType.CLEAR_INTERVAL_ID_FIELD],
    defaultParams: `''`,
  },
  [AppsmithFunction.getGeolocation]: {
    label: createMessage(GET_GEO_LOCATION),
    fields: [FieldType.CALLBACK_FUNCTION_FIELD],
    defaultParams: `(location) => {
      // add code here
    }`,
  },
  [AppsmithFunction.watchGeolocation]: {
    label: createMessage(WATCH_GEO_LOCATION),
    fields: [],
    defaultParams: "",
  },
  [AppsmithFunction.stopWatchGeolocation]: {
    label: createMessage(STOP_WATCH_GEO_LOCATION),
    fields: [],
    defaultParams: "",
  },
  [AppsmithFunction.postWindowMessage]: {
    label: createMessage(POST_MESSAGE),
    fields: [
      FieldType.MESSAGE_FIELD,
      FieldType.SOURCE_FIELD,
      FieldType.TARGET_ORIGIN_FIELD,
    ],
    defaultParams: `'', 'window', '*'`,
  },
};