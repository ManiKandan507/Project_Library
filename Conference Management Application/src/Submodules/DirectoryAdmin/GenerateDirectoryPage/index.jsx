import { useState } from "react";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { useApi } from "../hooks/useApi";
import { Select } from "semantic-ui-react";
import OrderedMultiSelect from "../components/OrderedMultiSelect";
import GeneratedCode from "../components/GeneratedCode";

const GenerateDirectoryPage = () => {
  const appDir = useSelector(state => state.directory.APP_DIR);
  const history = useHistory();

  const [group, setGroup] = useState(-1);
  const [validExpiryRequired, setValidExpiryRequired] = useState(false);
  const [profileFields, setProfileFields] = useState([]);
  const [loadingGroups, groupMap] = useApi("GROUPS");

  if (loadingGroups) return null;

  const searchParams = new URLSearchParams();
  searchParams.set("validExpiryRequired", validExpiryRequired);
  if (profileFields.length) searchParams.set("profileFields", profileFields);

  const endpoint = `https://dir.econference.io/main/${appDir}/group/${group.uuid}?${searchParams}`;

  const embedIframe = `<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.min.js?ver=5.8.1' id='iframeResizer-js'></script>
  <iframe src="${endpoint}" title="${group.label} directory" frameborder="0" style="overflow:hidden;" width="100%" class="xcd_iframe"></iframe>
  <script>iFrameResize({log:true,heightCalculationMethod:'taggedElement',checkOrigin:false,autoResize:true,tolerance:0,bodyMargin:'0.5em',bodyBackground:'#fff'})</script>`;
  const wordpressShortCode = `[xcd_directory groupuuid="${group.uuid}" validExpiryRequired="${validExpiryRequired}" profileFields="${profileFields}"]`;

  const groupOptions = [...groupMap.entries()].map(([id, group]) => ({
    key: id,
    text: group.label,
    value: id,
  }));

  const back = () => {
    history.push("./main");
  };

  const profileFieldsOptionMap = new Map([
    Array(2).fill("Prefix"),
    Array(2).fill("Firstname"),
    Array(2).fill("MiddleInitial"),
    Array(2).fill("Lastname"),
    Array(2).fill("Degrees"),
    Array(2).fill("Company"),
    Array(2).fill("City"),
    Array(2).fill("State"),
    Array(2).fill("Country"),
  ]);

  return (
    <main>
      <section className="flex" style={{ marginBottom: "1.7em" }}>
        <button onClick={back}>Back</button>
      </section>

      <section className="flex items-center" style={{ gap: "1em" }}>
        <h2 className="header" style={{ fontSize: "1.75rem" }}>
          Generate Directory
        </h2>
        <span
          className={`bg-primary-dark fg-white font-bold rounded`}
          style={{
            padding: ".3em .7em",
          }}
        >
          Group - Member
        </span>
        {group !== -1 && (
          <a
            target="_blank"
            href={endpoint}
            style={{ marginRight: ".5em" }}
            className="fg-primary ml-auto underline"
          >
            Preview Live
          </a>
        )}
      </section>
      <p className="subtitle">
        A small group directory for embedding, copy embed code to save changes.
      </p>
      <hr style={{ marginTop: "1.5em", marginBottom: "1em" }} />
      <form action="" className="directory-form" style={{ padding: "2em 1em" }}>
        <div>
          <h5 className="form-header">Group</h5>
          <p className="form-subtitle">
            This is the main filter for inclusion in the directory.
          </p>
        </div>
        <div className="form-field">
          <Select
            value={group.id}
            className="m-0"
            placeholder="Select group"
            size="large"
            options={groupOptions}
            onChange={(_, data) =>
              setGroup({
                id: data.value,
                uuid: groupMap.get(data.value).uuid,
                label: groupMap.get(data.value).label,
              })
            }
          />
        </div>
        <div>
          <h5 className="form-header">Only Display Current Members</h5>
          <p className="form-subtitle">
            Members who are expired will not display.
          </p>
        </div>
        <div className="form-field">
          <input
            className="form-field"
            type="checkbox"
            className="m-0"
            checked={validExpiryRequired}
            onChange={e => setValidExpiryRequired(e.target.checked)}
          />
        </div>

        <div>
          <h5 className="form-header">Directory Profile Display</h5>
          <p className="form-subtitle">
            Select contact profile to display within the directory.
          </p>
        </div>

        <div className="form-field">
          <OrderedMultiSelect
            optionMap={profileFieldsOptionMap}
            selectedIds={profileFields}
            onChange={header => setProfileFields(header)}
          />
        </div>

        {group !== -1 && (
          <>
            <div>
              <h5 className="form-header">IFrame</h5>
              <p className="form-subtitle">Embed as a HTML iframe.</p>
            </div>
            <div className="form-field">
              <GeneratedCode code={embedIframe} />
            </div>

            <div>
              <h5 className="form-header">Wordpress Short Code</h5>
              <p className="form-subtitle">
                Embed using X-CD For Wordpress plugin.
              </p>
            </div>
            <div className="form-field">
              <GeneratedCode code={wordpressShortCode} />
            </div>
          </>
        )}
      </form>
    </main>
  );
};

export default GenerateDirectoryPage;
