// BlogFormReview shows users their form inputs for review
import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import formFields from './formFields';
import { withRouter } from 'react-router-dom';
import * as actions from '../../actions';

class BlogFormReview extends Component {
  state = { file: null };  //file image upload. See imageUpload.txt.

  renderFields() {
    const { formValues } = this.props;

    return _.map(formFields, ({ name, label }) => {
      return (
        <div key={name}>
          <label>{label}</label>
          <div>{formValues[name]}</div>
        </div>
      );
    });
  }

  renderButtons() {
    const { onCancel } = this.props;

    return (
      <div>
        <button
          className="yellow darken-3 white-text btn-flat"
          onClick={onCancel}
        >
          Back
        </button>
        <button className="green btn-flat right white-text">
          Save Blog
          <i className="material-icons right">email</i>
        </button>
      </div>
    );
  }

  onSubmit(event) {
    event.preventDefault();

    const { submitBlog, history, formValues } = this.props;

    submitBlog(formValues, history);
  }

  onFileChange(event) { //image upload event handler.The 'event' object contains the image file uploaded.
    this.setState({ file: event.target.files });/* We place the file on the component(BlogFormReview) state.*/
    console.log(event.target.files); /* From the browse console(inspect), we see the console for 'event.target.files'. It returns 'FileList' which is like an Array that contains a reference to all the different image files that we attached using the image 'input' below. It contains the name and the type of the attached file.
    * We can also use the returned file object to get access to the undelying image file that actually exists on our hard-drive.*/
  }

  render() {
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <h5>Please confirm your entries</h5>
        {this.renderFields()}
        
        <h5>Add an Image Mr.Adika</h5>
        <input onChange={this.onFileChange.bind(this)}
        type="file" accept="image/*" 
        />

        {this.renderButtons()}
      </form>
    );
  }
}

function mapStateToProps(state) {
  return { formValues: state.form.blogForm.values };
}

export default connect(mapStateToProps, actions)(withRouter(BlogFormReview));
