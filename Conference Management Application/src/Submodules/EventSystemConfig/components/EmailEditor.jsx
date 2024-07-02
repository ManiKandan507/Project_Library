import { useState, useMemo, useRef, useEffect } from 'react';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, { defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/static-toolbar/lib/plugin.css';
import createToolbarPlugin, {
    Separator,
  } from '@draft-js-plugins/static-toolbar';
  import {
    ItalicButton,
    BoldButton,
    UnderlineButton,
    CodeButton,
    HeadlineOneButton,
    HeadlineTwoButton,
    HeadlineThreeButton,
    UnorderedListButton,
    OrderedListButton,
    BlockquoteButton,
    CodeBlockButton,
  } from '@draft-js-plugins/buttons';

import editorStyles from './assets/editorStyles.module.css';
import { Popover } from 'antd';



// Toolbar Plugin
const toolbarPlugin = createToolbarPlugin();
const { Toolbar } = toolbarPlugin;



// Hotkey AutoComplete Plugin
const Mention = ({className, mention}) => <>
    <Popover content={mention.hint}>
        <span className={className}>{mention.name}</span>
    </Popover>
</>

const createStandardMentionPlugin = () => createMentionPlugin({
    mentionComponent: Mention,
    entityMutability: 'IMMUTABLE',
    mentionTrigger:'[',
    supportWhitespace: true,
});




function EmailField({ editorState, onChangeEditorState, hotkeys, readOnly }) {
  
    const ref = useRef(null);

    // AntD v5.0
    // const [inputClassName, setInputClassName] = useState(undefined);
  
    // useEffect(() => {
    //   if (!inputClassName) {
    //     let inputElement = document.querySelector('input[class*="css-dev-only-do-not-override-"]');
        
    //     if (!inputElement) {
    //       inputElement = document.querySelector('input[class*="css-"]')
    //     }

    //     if (inputElement) {
    //       console.log(inputElement.className)
    //       setInputClassName(inputElement.className)
    //     }
    //   }
    // }, [])
    
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(hotkeys);

  const {MentionSuggestions, mentionPlugin} = useMemo(() => {
    const mentionPlugin = createStandardMentionPlugin()
    const {MentionSuggestions} = mentionPlugin;
    return {MentionSuggestions, mentionPlugin}
  }, []);

  const plugins = [toolbarPlugin, mentionPlugin]


  const onOpenChange = (_open) => {
    setOpen(_open);
  };

  const onSearchChange = ({ value }) => {
    setSuggestions(defaultSuggestionsFilter(value, hotkeys));
  }


  return (
    <div className={"ant-input"} style={{padding: "14px 10px"}} onClick={() => ref.current.focus()}>
      <Editor
        editorKey="editor"
        editorState={editorState}
        onChange={onChangeEditorState}
        plugins={plugins}
        ref={ref}
        readOnly={readOnly}
      />
      <MentionSuggestions
        open={open}
        onOpenChange={onOpenChange}
        suggestions={suggestions}
        onSearchChange={onSearchChange}
        onAddMention={() => {/* Handle mention addition */}}
      />
      <div style={{width:"100%", height:"10px"}}></div>
      <Toolbar>
            {
              // may be use React.Fragment instead of div to improve perfomance after React 16
              (externalProps) => (
                <>
                  <BoldButton {...externalProps} />
                  <ItalicButton {...externalProps} />
                  <UnderlineButton {...externalProps} />
                  <CodeButton {...externalProps} />
                  <Separator {...externalProps} />
                  <HeadlinesButton {...externalProps} />
                  <UnorderedListButton {...externalProps} />
                  <OrderedListButton {...externalProps} />
                  <BlockquoteButton {...externalProps} />
                  <CodeBlockButton {...externalProps} />
                </>
              )
            }
      </Toolbar>
    </div>
  );
}

export const SubjectLineField = ({ editorState, onChangeEditorState, hotkeys, readOnly }) => {
    const ref = useRef(null);

    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState(hotkeys);


    // AntD V5 only
    // const [inputClassName, setInputClassName] = useState(undefined);

    // useEffect(() => {
    //   if (!inputClassName) {
    //     let inputElement = document.querySelector('input[class*="css-dev-only-do-not-override-"]');
        
    //     if (!inputElement) {
    //       inputElement = document.querySelector('input[class*="css-"]')
    //     }

    //     if (inputElement) {
    //       console.log(inputElement.className)
    //       setInputClassName(inputElement.className);
    //     }
    //   }
    // }, [])


  
    const {MentionSuggestions, mentionPlugin} = useMemo(() => {
        const mentionPlugin = createStandardMentionPlugin()
        const {MentionSuggestions} = mentionPlugin;
        return {MentionSuggestions, mentionPlugin}
      }, []);

    const onOpenChange = (_open) => {
      setOpen(_open);
    };
  
    const onSearchChange = ({ value }) => {
      setSuggestions(defaultSuggestionsFilter(value, hotkeys));
    };

    const disabledStyles = readOnly ? "ant-input-disabled" : ""
 
    return (
      <div className={`${disabledStyles} ant-input`} onClick={() => ref.current.focus()}>
        <Editor
          editorKey="editor"
          editorState={editorState}
          onChange={onChangeEditorState}
          plugins={[mentionPlugin]}
          ref={ref}
          readOnly={readOnly}
        />
        <MentionSuggestions
          open={open}
          onOpenChange={onOpenChange}
          suggestions={suggestions}
          onSearchChange={onSearchChange}
        />
      </div>
    );
  }
  


const HeadlinesPicker = (props) => {
  const onWindowClick = () => {
    // Call `onOverrideContent` again with `undefined`
    // so the toolbar can show its regular content again.
    props.onOverrideContent(undefined);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      window.addEventListener('click', onWindowClick);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', onWindowClick);
    };
  }, []);

  const buttons = [HeadlineOneButton, HeadlineTwoButton, HeadlineThreeButton];
  return (
    <div>
      {buttons.map((Button, i) => (
        <Button key={i} {...props} />
      ))}
    </div>
  );
}


function HeadlinesButton({ onOverrideContent }) {
  const onClick = () => {
    // A button can call `onOverrideContent` to replace the content
    // of the toolbar. This can be useful for displaying sub
    // menus or requesting additional information from the user.
    onOverrideContent(HeadlinesPicker);
  };

  return (
    <div className={editorStyles.headlineButtonWrapper}>
      <button onClick={onClick} className={editorStyles.headlineButton}>
        H
      </button>
    </div>
  );
}



export default EmailField;
