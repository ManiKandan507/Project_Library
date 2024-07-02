import React from "react";

class TagInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: props.tags?props.tags:[],
      focused: false,
      input: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
  }

  render() {
    const styles = {
      container: {
        border: '1px solid #ddd',
        padding: '5px',
        borderRadius: '5px',
        width:'100%',
        marginBottom:0
      },

      items: {
        display: 'inline-block',
        padding: '2px',
        border: '1px solid grey',
        borderRadius: '5px',
        marginRight: '5px',
        cursor: 'pointer'
      },

      input: {
        outline: 'none',
        border: 'none',
        fontSize: '14px',
        width:'100%'
      },

      closeButton:{
        color:'grey',
        fontSize:14,
        marginLeft:4
      }
    };
    return (
      <label style={{width:'100%'}}>
        <ul style={styles.container}>
          {this.state.items.map((item, i) => 
            <li key={i} style={styles.items} onClick={this.handleRemoveItem(i)}>
              {item}
              <span style={styles.closeButton}>X</span>
            </li>
          )}
          <input
            style={styles.input}
            value={this.state.input}
            onChange={this.handleInputChange}
            onKeyDown={this.handleInputKeyDown} />
        </ul>
      </label>
    );
  }

  handleInputChange(evt) {
    this.setState({ input: evt.target.value });
  }

  handleInputKeyDown(evt) {
    if ( evt.keyCode === 13 ) {
      const {value} = evt.target;
      
      this.setState(state => ({
        items: [...state.items, value],
        input: ''
      }));
      this.props.setTags([...this.state.items, value]);
    }

    if ( this.state.items.length && evt.keyCode === 8 && !this.state.input.length ) {
      this.setState(state => ({
        items: state.items.slice(0, state.items.length - 1)
      }));
      this.props.setTags(this.state.items.slice(0, this.state.items.length - 1));
    }
    
  }

  handleRemoveItem(index) {
    return () => {
      this.setState(state => ({
        items: state.items.filter((item, i) => i !== index)
      }));
      this.props.setTags(this.state.items.filter((item, i) => i !== index));
    }
  }
}

export default TagInput;