import React from "react";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
//import CustomUploadPlugin from "./UploadAdaptor";
//import { Form } from "antd";

export default ({ message, setMessage, onFocusBox }) => (
  <div>
    <CKEditor
      editor={ClassicEditor}
      data={message}
      toolbar={["imageUpload"]}
      config={{
        mediaEmbed: { previewsInData: true },
        toolbar:{shouldNotGroupWhenFull: true},
      }}
      onFocus={()=>onFocusBox('message', 'focus')}
      onBlur={()=>onFocusBox('message', 'blur')}
      onChange={ ( event, editor ) => {
        const data = editor.getData();
        setMessage(data);
      } }
    />
  </div>
);
