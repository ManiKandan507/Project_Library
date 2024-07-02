import { useContext } from "react";
import { useSelector } from "react-redux";
import DirectoryContext from "../DirectoryContext";
import { useParams } from "react-router";

import GeneratedCode from "../../components/GeneratedCode";

const EmbedSection = () => {
  const { directoryUuid } = useParams();
  const appDir = useSelector(state => state.directory.APP_DIR);
  const xcdHostedUrl = useSelector(state => state.directory.XCD_HOSTED_URL);

  const { editedDirectory } = useContext(DirectoryContext);

  const embedLink =
    editedDirectory.type === "company"
      ? `https://corpdir.econference.io/${appDir}/${directoryUuid}`
      : `https://dir.econference.io/main/${appDir}/${directoryUuid}`;

//   const embedIframe = `<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.min.js?ver=5.8.1' id='iframeResizer-js'></script>
// <iframe src="${embedLink}" title="${editedDirectory.name}" frameborder="0" style="overflow:hidden;" width="100%" class="xcd_iframe"></iframe>
// <script>iFrameResize({log:true,heightCalculationMethod:'taggedElement',checkOrigin:false,autoResize:true,tolerance:0,bodyMargin:'0.5em',bodyBackground:'#fff'})</script>`;

const embedIframe = `<iframe src="${embedLink}" title="${editedDirectory.name}" frameborder="0" style="overflow:hidden; height: 100vh; border: none;" width="100%" class="xcd_iframe"></iframe>`;
  const wordpressShortCode = `[${
    editedDirectory.type === "company" ? "xcd_corpdirectory" : "xcd_directory"
  }  id="${directoryUuid}"]`;

  const xcdHosted = `${xcdHostedUrl}?directoryid=${directoryUuid}`;

  return (
    <form action="" className="directory-form">
      <div>
        <h5 className="form-header">IFrame</h5>
        <p className="form-subtitle">Embed as a HTML iframe.</p>
      </div>
      <div className="form-field">
        <GeneratedCode code={embedIframe} />
      </div>
      <div>
        <h5 className="form-header">Wordpress Short Code</h5>
        <p className="form-subtitle">Embed using X-CD For Wordpress plugin.</p>
      </div>
      <div className="form-field">
        <GeneratedCode code={wordpressShortCode} />
      </div>
      <div>
        <h5 className="form-header">X-CD Hosted</h5>
        <p className="form-subtitle">Embed as an X-CD hosted application.</p>
      </div>
      <div className="form-field">
        <GeneratedCode code={xcdHosted} />
      </div>
    </form>
  );
};

export default EmbedSection;
