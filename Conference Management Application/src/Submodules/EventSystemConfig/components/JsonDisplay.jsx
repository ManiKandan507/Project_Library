const JsonDisplay = ({obj}) => {
    let formattedJSON = JSON.stringify(obj, null, 2)
    return (
        <pre>
          <code>
            {formattedJSON}
          </code>
        </pre>
    );
}

export default JsonDisplay