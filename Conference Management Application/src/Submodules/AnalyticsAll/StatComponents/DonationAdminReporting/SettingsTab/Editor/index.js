import React, { Component } from "react";
import ReactQuill, { Quill } from "react-quill";
import 'react-quill/dist/quill.snow.css'
import ImageUploader from "quill-image-uploader";
import ImageResize from "quill-image-resize-module-react";
import CommonSpinner from "../../common/CommonSpinner";

Quill.register("modules/imageUploader", ImageUploader);
Quill.register('modules/imageResize', ImageResize);

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            loading: false
        };
    }

    modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ size: [] }],
            [{ font: [] }],
            [{ align: ["right", "center", "justify"] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            [{ color: ["red", "#785412"] }],
            [{ background: ["red", "#785412"] }]
        ],
        imageResize: {
            parchment: Quill.import('parchment')
        },
        imageUploader: {
            upload: file => {
                return new Promise((resolve, reject) => {
                    const myHeaders = new Headers();
                    myHeaders.append("Content-Type", "image/png");

                    const requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: file,
                        redirect: 'follow'
                    };
                    this.setState({
                        loading: true
                    })
                    fetch("https://z4v1tffmof.execute-api.us-east-1.amazonaws.com/Prod/api/file/upload/default/user", requestOptions)
                        .then(response => response.json())
                        .then(result => {
                            resolve(result?.url);
                            this.setState({
                                loading: false
                            })
                        })
                        .catch(error => {
                            this.setState({
                                loading: false
                            })
                            reject("Upload failed ");
                            console.log('error ', error)
                        });
                })
            }
        }
    };

    formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "imageBlot"
    ];

    handleProcedureContentChange = (content) => {
        if (this.props.type === 'footer') {
            this.props.setDonationInvoice((prev) => ({
                ...prev,
                donationFooter: content
            }))
        } else {
            this.props.setDonationInvoice((prev) => ({
                ...prev,
                donationHeader: content
            }))
        }
    };

    render() {

        return (
            <CommonSpinner loading={this.state.loading}>
                <div className="react-quill">
                    <ReactQuill
                        theme="snow"
                        modules={this.modules}
                        formats={this.formats}
                        value={this.props.type === 'footer' ? this.props.donationInvoice.donationFooter : this.props.donationInvoice.donationHeader}
                        onChange={(content) => this.handleProcedureContentChange(content)}
                    />
                </div>
            </CommonSpinner>
        );
    }
}

export default Editor;