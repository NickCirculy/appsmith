import * as Sentry from "@sentry/react";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, useLocation } from "react-router";
import styled from "styled-components";

import { updateTabsPanelWidth } from "actions/editorActions";
import { updateExplorerWidthAction } from "actions/explorerActions";
import { routeChanged } from "actions/focusHistoryActions";
import classNames from "classnames";
import EntityExplorerSidebar from "components/editorComponents/Sidebar";
import { tailwindLayers } from "constants/Layers";
import SideNavbar from "pages/Editor/SideNavbar";
import { getCanvasWidth, previewModeSelector } from "selectors/editorSelectors";
import { Installer } from "pages/Editor/Explorer/Libraries/Installer";
import { getExplorerWidth } from "selectors/explorerSelector";
import { AppsmithLocationState } from "utils/history";
import useHorizontalResize from "utils/hooks/useHorizontalResize";
import BottomBar from "./BottomBar";
import EditorsRouter from "./routes";
import WidgetsEditor from "./WidgetsEditor";

const SentryRoute = Sentry.withSentryRouting(Route);

const Container = styled.div`
  display: flex;
  height: calc(
    100vh - ${(props) => props.theme.smallHeaderHeight} -
      ${(props) => props.theme.bottomBarHeight}
  );
  background-color: ${(props) => props.theme.appBackground};
`;

function MainContainer() {
  const dispatch = useDispatch();
  const sidebarWidth = useSelector(getExplorerWidth);

  /**
   * on entity explorer sidebar width change
   *
   * @return void
   */
  const onLeftSidebarWidthChange = useCallback((newWidth) => {
    dispatch(updateExplorerWidthAction(newWidth));
  }, []);

  /**
   * on entity explorer sidebar drag end
   *
   * @return void
   */
  const onLeftSidebarDragEnd = useCallback(() => {
    dispatch(updateExplorerWidthAction(sidebarWidth));
  }, [sidebarWidth]);

  const isPreviewMode = useSelector(previewModeSelector);

  const location = useLocation<AppsmithLocationState>();

  useEffect(() => {
    dispatch(routeChanged(location));
  }, [location.pathname, location.hash]);

  const tabsPanelWidth = useSelector((state) => state.ui.mainCanvas.tabsWidth);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const onWidthChange = useCallback((width: number) => {
    dispatch(updateTabsPanelWidth(width));
    // setActionBarWidth(width);
  }, []);

  const onDragEnd = useCallback(() => {
    dispatch(updateTabsPanelWidth(tabsPanelWidth));
    // dispatch(updateCanvasLayoutAction(screen.width - tabsPanelWidth - 100));
  }, [tabsPanelWidth]);

  const {
    onMouseDown,
    onMouseUp,
    onTouchStart,
    resizing,
  } = useHorizontalResize(sidebarRef, onWidthChange, onDragEnd);

  const canvasWidth = useSelector(getCanvasWidth);

  return (
    <>
      <Container className="relative w-full overflow-x-hidden">
        <div className="flex flex-col h-full">
          <SideNavbar />
        </div>
        <EntityExplorerSidebar
          onDragEnd={onLeftSidebarDragEnd}
          onWidthChange={onLeftSidebarWidthChange}
          width={sidebarWidth}
        />
        {!isPreviewMode && (
          <div
            className={classNames({
              "relative transition-all transform duration-400": true,
              "translate-x-0 opacity-0": isPreviewMode,
              "flex flex-col overflow-auto opacity-100": !isPreviewMode,
              [`w-[${tabsPanelWidth}px] min-w-[${tabsPanelWidth}px] translate-x-${tabsPanelWidth}`]: !isPreviewMode,
            })}
            ref={sidebarRef}
            style={{
              borderRight: "1px solid #e8e8e8",
            }}
          >
            <div
              className={`cursor-ew-resize ${tailwindLayers.resizer}`}
              onMouseDown={onMouseDown}
              onTouchEnd={onMouseUp}
              onTouchStart={onTouchStart}
              style={{ width: tabsPanelWidth }}
            >
              <SentryRoute component={EditorsRouter} />
            </div>
          </div>
        )}
        <div
          className="relative flex flex-col overflow-auto"
          id="app-body"
          style={{ width: canvasWidth }}
        >
          <WidgetsEditor />
        </div>
      </Container>
      <BottomBar
        className={classNames({
          "translate-y-full fixed bottom-0": isPreviewMode,
          "translate-y-0 relative opacity-100": !isPreviewMode,
          "transition-all transform duration-400": true,
        })}
      />
      <Installer left={sidebarWidth} />
    </>
  );
}

MainContainer.displayName = "MainContainer";

export default MainContainer;
