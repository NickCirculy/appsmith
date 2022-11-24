import React, { MutableRefObject, useCallback, useRef } from "react";
import styled from "styled-components";
import { Icon, IconSize, Spinner, Toaster, Variant } from "design-system";
import { Colors } from "constants/Colors";
import Entity, { EntityClassNames } from "../Entity";
import {
  createMessage,
  CREATE_DATASOURCE_TOOLTIP,
} from "ce/constants/messages";
import InstallationWindow from "./InstallationWindow";
import { useDispatch, useSelector } from "react-redux";
import {
  selectInstallationStatus,
  selectLibrariesForExplorer,
} from "selectors/entitiesSelector";
import { InstallState } from "reducers/uiReducers/libraryReducer";
import { Collapse } from "@blueprintjs/core";
import { ReactComponent as CopyIcon } from "assets/icons/menu/copy-snippet.svg";
import useClipboard from "utils/hooks/useClipboard";
import { uninstallLibraryInit } from "actions/JSLibraryActions";
import { TJSLibrary } from "utils/DynamicBindingUtils";

const Library = styled.li`
  list-style: none;
  flex-direction: column;
  color: ${Colors.GRAY_700};
  font-weight: 400;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  line-height: 17px;
  padding-left: 8px;

  > div:first-child {
    height: 36px;
  }

  &:hover {
    background: ${Colors.SEA_SHELL};

    & .t--open-new-tab {
      display: block;
    }

    & .delete {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      &:hover {
        background: black;
        .uninstall-library {
          color: white;
        }
      }
    }
  }

  .loading {
    display: none;
    width: 30px;
    height: 36px;
    background: transparent;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & .t--open-new-tab {
    position: absolute;
    right: 8px;
    display: none;
  }

  .delete {
    display: none;
    width: 30px;
    height: 36px;
    background: transparent;
  }

  & .t--package-version {
    display: block;
    font-size: 12px;
  }
  .open-collapse {
    transform: rotate(90deg);
  }

  .content {
    font-size: 12px;
    font-weight: 400;
    padding: 4px 8px;
    color: ${Colors.GRAY_700};
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    overflow: hidden;
    .accessor {
      padding: 2px 8px;
      flex-grow: 1;
      border: 1px solid #b3b3b3;
      font-size: 12px;
      background: white;
      display: flex;
      height: 26px;
      width: calc(100% - 80px);
      justify-content: space-between;
      align-items: center;
      color: ${Colors.ENTERPRISE_DARK};
    }
  }
`;
const Name = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  word-break: break-all;
  line-height: 17px;
`;
const Version = styled.span<{ version?: string }>`
  display: ${(props) => (props.version ? "block" : "none")};
  margin-right: ${(props) => (props.version ? "8px" : "0")};
`;

const PrimaryCTA = function({ lib }: { lib: TJSLibrary }) {
  const installationStatus = useSelector(selectInstallationStatus);
  const dispatch = useDispatch();

  const url = lib.url as string;

  const uninstallLibrary = useCallback(() => {
    dispatch(uninstallLibraryInit(lib));
  }, [lib]);

  if (installationStatus[url] === InstallState.Queued)
    return (
      <div className="loading">
        <Spinner size={IconSize.MEDIUM} />
      </div>
    );

  if (url) {
    //Default libraries will not have url
    return (
      <div className="delete" onClick={uninstallLibrary}>
        <Icon
          className="uninstall-library"
          name="trash-outline"
          size={IconSize.MEDIUM}
        />
      </div>
    );
  }

  return null;
};

function LibraryEntity({ lib }: any) {
  const openDocs = (name: string, url: string) => () => window.open(url, name);
  const propertyRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const write = useClipboard(propertyRef);

  const copyToClipboard = useCallback(() => {
    write(lib.accessor);
    Toaster.show({
      text: "Copied to clipboard",
      variant: Variant.success,
    });
  }, [lib.accessor]);

  const [isOpen, open] = React.useState(false);
  return (
    <Library>
      <div className="flex flex-row items-center h-full">
        <Icon
          className={isOpen ? "open-collapse" : ""}
          fillColor={Colors.GREY_7}
          name="right-arrow-2"
          onClick={() => open(!isOpen)}
          size={IconSize.XXXL}
        />
        <Name>{lib.name}</Name>
        <Version
          className="t--package-version"
          onClick={openDocs(lib.name, lib.docsURL)}
          version={lib.version}
        >
          {lib.version}
        </Version>
        <PrimaryCTA lib={lib} />
      </div>
      <Collapse className="text-xs" isOpen={isOpen}>
        <div className="content pr-2">
          Available as{" "}
          <div className="accessor">
            {lib.accessor[lib.accessor.length - 1]}{" "}
            <CopyIcon onClick={copyToClipboard} />
          </div>
        </div>
      </Collapse>
    </Library>
  );
}

function JSDependencies() {
  const libraries = useSelector(selectLibrariesForExplorer);
  const dependencyList = libraries.map((lib) => (
    <LibraryEntity key={lib.name} lib={lib} />
  ));
  const [isWindowOpen, openWindow] = React.useState(false);

  return (
    <Entity
      addButtonHelptext={createMessage(CREATE_DATASOURCE_TOOLTIP)}
      className={"libraries"}
      customAddButton={
        <InstallationWindow
          className={`${EntityClassNames.ADD_BUTTON} group libraries h-100`}
          onOpen={openWindow}
          open={false}
        />
      }
      entityId="library_section"
      icon={null}
      isDefaultExpanded={isWindowOpen}
      isSticky
      name="Libraries"
      step={0}
    >
      {dependencyList}
    </Entity>
  );
}

export default React.memo(JSDependencies);