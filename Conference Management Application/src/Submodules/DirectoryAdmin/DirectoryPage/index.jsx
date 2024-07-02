import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router";

import { useApi } from "../hooks/useApi";

import { Tab } from "semantic-ui-react";

import DirectoryContext from "./DirectoryContext";
import LocalizationSection from "./LocalizationSection";
import GeneralSection from "./GeneralSection";
import ColorsSection from "./ColorsSection";
import FiltersSection from "./FiltersSection";
import TogglesSection from "./TogglesSection";
import EmbedSection from "./EmbedSection";
import ConfirmDialog from "../components/ConfirmDialog";

import moment from "moment";

import {
  requestUpdateDirectory,
  requestRemoveDirectory,
} from "../store/actions/directory";
import { capitalize } from "../helpers";

import "./index.css";

const DirectoryPage = () => {
  const { directoryUuid } = useParams();
  const appDir = useSelector(state => state.directory.APP_DIR);
  const history = useHistory();
  const dispatch = useDispatch();
  const [loadingDirectories, directories] = useApi("DIRECTORIES");

  const directory = useMemo(() =>
    directories.find(d => d.uuid === directoryUuid, [directories])
  );

  const [editedDirectory, setEditedDirectory] = useState({});

  const [confirm, setConfirm] = useState({
    prompt: "",
    onConfirm: null,
  });

  const hasChanges = useMemo(
    () => (JSON.stringify(directory) !== JSON.stringify(editedDirectory)) &&
      ((editedDirectory?.regionFilter?.show_world_region && editedDirectory?.regionFilter?.world_region_label) || !editedDirectory?.regionFilter?.show_world_region) &&
      ((editedDirectory?.regionFilter?.show_america_region && editedDirectory?.regionFilter?.america_region_label) || !editedDirectory?.regionFilter?.show_america_region),
    [directory, editedDirectory]
  );

  useEffect(() => {
    if (!directory) return;
    setEditedDirectory(JSON.parse(JSON.stringify(directory)));
  }, [directory]);

  const saveChanges = async () => {
    dispatch(requestUpdateDirectory(editedDirectory));
  };

  const revertChanges = () => {
    setConfirm({
      prompt:
        "Are you sure you want to revert changes? This action will remove unsaved changes.",
      onConfirm: () => {
        setEditedDirectory(JSON.parse(JSON.stringify(directory)));
        setConfirm({});
      },
    });
  };

  const back = () => {
    if (JSON.stringify(directory) === JSON.stringify(editedDirectory))
      return history.push("../main");

    setConfirm({
      prompt: "You have unsaved changes, save and quit?",
      onConfirm: () => {
        saveChanges();
        history.push("../main");
      },
    });
  };

  const remove = () => {
    setConfirm({
      prompt:
        "Are you sure you want to remove this directory? This action is irreversible.",
      onConfirm: () => {
        dispatch(requestRemoveDirectory(directory));
        history.push("../main");
      },
    });
  };

  if (loadingDirectories) return null;

  const panes = [
    {
      menuItem: "General",
      render: () => <GeneralSection />,
    },
    {
      menuItem: "Filters",
      render: () => <FiltersSection />,
    },
    {
      menuItem: "Options",
      render: () => <TogglesSection />,
    },
    {
      menuItem: "Colors",
      render: () => <ColorsSection />,
    },
    {
      menuItem: "Profile Fields",
      render: () => <LocalizationSection />,
    },
    {
      menuItem: "Embed",
      render: () => <EmbedSection />,
    },
  ];

  const previewLink =
    editedDirectory.type === "company"
      ? `https://corpdir.econference.io/${appDir}/${directoryUuid}`
      : `https://dir.econference.io/main/${appDir}/${directoryUuid}`;

  return (
    <DirectoryContext.Provider value={{ editedDirectory, setEditedDirectory }}>
      <section className="flex" style={{ marginBottom: "1.7em" }}>
        <button onClick={back}>Back</button>
        <button onClick={remove} className="ml-auto">
          <i className="trash icon"></i>
        </button>
        <button
          disabled={!hasChanges}
          onClick={revertChanges}
          style={{ marginLeft: ".5em" }}
        >
          Revert
        </button>
        <button
          disabled={!hasChanges}
          onClick={saveChanges}
          style={{ marginLeft: ".5em" }}
          className="primary"
        >
          {hasChanges ? "Save Changes" : "Changes Saved"}
        </button>
      </section>

      <section className="flex items-center" style={{ gap: "1em" }}>
        <h2 className="header" style={{ fontSize: "1.75rem" }}>
          {directory.name}{" "}
        </h2>
        <span
          className={`${directory.type === "company" ? "bg-primary" : "bg-primary-dark"
            } fg-white font-bold rounded`}
          style={{ padding: ".3em .7em" }}
        >
          {capitalize(directory.type)}
        </span>
        <a
          target="_blank"
          href={previewLink}
          style={{ marginRight: ".5em" }}
          className="fg-primary ml-auto underline"
        >
          Preview Live
        </a>
        <p className="">
          Last Updated: <em>{moment(directory.lastUpdated).format("lll")}</em>
        </p>
      </section>

      <hr
        style={{
          marginTop: "1.5em",
          marginBottom: "2em",
        }}
      />

      <Tab
        className="semantic-tab"
        size="large"
        menu={{ secondary: true, vertical: true, fluid: true }}
        panes={panes}
      />

      {confirm.prompt && (
        <ConfirmDialog
          prompt={confirm.prompt}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm({ prompt: "" })}
        />
      )}
    </DirectoryContext.Provider>
  );
};

export default DirectoryPage;
