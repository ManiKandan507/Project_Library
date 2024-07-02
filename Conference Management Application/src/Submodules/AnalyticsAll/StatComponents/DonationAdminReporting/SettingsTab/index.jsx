import React, { useEffect, useContext, useState } from "react";
import { Button, Col, Divider, Row, Table, Typography, Tooltip, notification, Form, Segmented } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Editor from "./Editor";
import GlobalContext from "../context/DonationContext";
import CommonModal from "../common/CommonModal";
import CommonSpinner from "../common/CommonSpinner";
import CommonForm from "./CommonForm";

const Settings = (props) => {

    const [form] = Form.useForm();
    const { CategoryTypes } = props;
    const { config } = useContext(GlobalContext)
    // const { appDir, options } = config
    const { appDir, options } = props;
    const { headers } = options;
    const [donationCategory, setDonationCategory] = useState([])
    const [selectedButton, setSeletedButton] = useState('DonationType')
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedDonation, setSelectedDonation] = useState({
        donation_id: "",
        donation_label: "",
        external_product_code: ""
    })
    const [showAddModal, setShowAddModal] = useState(false)
    const [addDonation, setAddDonation] = useState({
        donation_label: '',
        external_product_code: ''
    })
    const [deleteDonation, setDeleteDonation] = useState({
        donationid: '',
        donationLabel: '',
    })
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [donationInvoice, setDonationInvoice] = useState({
        donationHeader: '',
        donationFooter: ''
    })

    const [renderDonation, setRenderDonation] = useState(false);

    useEffect(() => {
        getDonationCategory()
    }, [appDir, options])

    useEffect(() => {
        if (renderDonation === true) {
            getDonationCategory()
            setRenderDonation(false)
        }
    }, [renderDonation])

    const handleButtons = (value) => {
        setSeletedButton(value)
    }

    const handleEditModal = (data) => {
        setSelectedDonation({
            donation_id: data?.donation_id,
            donation_label: data?.donation_name,
            external_product_code: data?.external_product_code
        })
        setShowEditModal(true)
    }

    const handleDeleteModal = (data) => {
        setDeleteDonation({
            donationid: data?.donation_id,
            donationLabel: data?.donation_name,
        })
        setShowDeleteModal(true)
    }


    const updateDonationAPI = async (functionType, body) => {

        try {
            setLoading(true)
            const response = await fetch(`${appDir}?module=donations&component=types_admin&function=${functionType}`, {
                headers: {
                    "Authorization": `${headers.Authorization}`,
                    "Content-Type": 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(body)
            })
            const result = await response.json()
            if (result?.success === true) {
                setLoading(false)
                setRenderDonation(true)
                notification.success({
                    message: result.result,
                })
            } else {
                setLoading(false)
                notification.error({
                    message: result.result
                })
            }
        }
        catch (e) {
            setLoading(false)
            console.log("error", e);
        }
    }

    const updateInvoiceAPI = async (donationInvoice) => {
        try {
            setLoading(true)
            const response = await fetch(`${appDir}?module=donations&component=settings&function=update_settings`, {
                headers: {
                    "Authorization": `${headers.Authorization}`,
                    "Content-Type": 'application/json'
                },
                method: "POST",
                body: JSON.stringify(donationInvoice)
            })
            const result = await response.json()
            if (result?.Success === "1") {
                setLoading(false)
                notification.success({
                    message: result.RESULT
                })
            } else {
                setLoading(false)
                notification.error({
                    message: result.RESULT
                })
            }
        }
        catch (e) {
            setLoading(false)
            console.log("error", e);
        }
    }

    const getInvoiceAPI = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${appDir}?module=donations&component=settings&function=get_settings`, {
                headers: {
                    "Authorization": `${headers.Authorization}`,
                },
                method: 'GET'
            })
            const result = await response.json()
            if (Object.keys(result).length) {
                setLoading(false)
                setDonationInvoice({
                    donationHeader: result.donationHeader,
                    donationFooter: result.donationFooter
                })
            } else {
                setLoading(false)
                setDonationInvoice({
                    donationHeader: '',
                    donationFooter: ''
                })
            }
        }
        catch (e) {
            setLoading(false)
            console.log("error", e);
        }
    }

    useEffect(() => {
        getInvoiceAPI()
    }, [appDir, headers])

    const getDonationCategory = async () => {
        try {
            setLoading(true)
            const result = await fetch(`${appDir}?module=donations&component=types_admin&function=see_donation_types`, options)
            const values = await result.json()
            if (values.length) {
                setLoading(false)
                setDonationCategory(values)
            }
        } catch (e) {
            setLoading(false)
            console.log("error", e);
        }
    }


    const donationHeader = [
        {
            title: "DONATION TYPE",
            dataIndex: "donation_name",
            key: "donation_name",
            width: '90%',
            className: "text-left",
            render: (_, data) => {
                return (
                    <div >
                        {data?.donation_name}
                    </div>
                )
            }
        },
        {
            title: "ACTIONS",
            dataIndex: "Actions",
            key: "Actions",
            width: '5%',
            className: "text-left",
            render: (_, data) => {
                return <div>
                    <Row style={{ gap: '20%' }}>
                        <Col>
                            <Tooltip title={"Edit"} placement="top" >
                                <EditOutlined style={{ fontSize: "large" }} onClick={() => { handleEditModal(data) }} />
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip title={"Delete"} placement="top" >
                                <DeleteOutlined style={{ fontSize: "large" }} onClick={() => handleDeleteModal(data)} />
                            </Tooltip>
                        </Col>
                    </Row>
                </div>
            },
        },
    ]

    const handleFormSubmit = (values, type) => {

        switch (type) {
            case "EDIT":
                const editedDonation = { ...values, donationid: selectedDonation.donation_id }
                setShowEditModal(false)
                updateDonationAPI('update_donation', editedDonation)
                break;
            case "ADD":
                const addedDonation = { ...values }
                setShowAddModal(false)
                updateDonationAPI('create_donation', addedDonation)
                break;
            case "DELETE":
                setShowDeleteModal(false)
                updateDonationAPI('delete_donation', { donationid: deleteDonation.donationid })
                break;
            default:
                break;
        }
    }

    const handleFormCancel = (type) => {
        switch (type) {
            case "EDIT":
                setSelectedDonation({
                    donation_id: '',
                    donation_label: '',
                    external_product_code: ''
                })
                setShowEditModal(false)
                break;
            case "ADD":
                setShowAddModal(false)
                break;
            case "DELETE":
                setDeleteDonation({
                    donationid: '',
                    donationLabel: ''
                })
                setShowDeleteModal(false)
                break;
            default:
                break;
        }
        if (type === "EDIT") {
            setSelectedDonation({
                donation_id: '',
                donation_label: '',
                external_product_code: ''
            })
            setShowEditModal(false)
        }
        else if (type === "ADD") {
            setShowAddModal(false)
        }
        else if (type === "DELETE") {
            setDeleteDonation({
                donationid: '',
                donationLabel: ''
            })
            setShowDeleteModal(false)
        }

    }

    const handleFormValidation = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const renderEditModal = () => {
        return (
            <CommonModal
                title={"Edit Donation Type"}
                open={showEditModal}
                onCancel={() => handleFormCancel("EDIT")}
                footer={[
                    <Button onClick={() => handleFormCancel("EDIT")}>Close</Button>,
                    <Button
                        // className="confirm-button"
                        onClick={() => { form.submit() }} type="primary">
                        Submit
                    </Button>,
                ]}
            >
                <CommonForm
                    form={form}
                    selectedDonation={selectedDonation}
                    onFinish={(values) => handleFormSubmit(values, "EDIT")}
                    onFinishFailed={handleFormValidation}
                />
            </CommonModal>
        )
    }

    const renderAddModal = () => {
        return (
            <CommonModal
                title={'Add Donation Type'}
                open={showAddModal}
                onCancel={() => handleFormCancel("ADD")}
                footer={[
                    <Button onClick={() => handleFormCancel("ADD")}>Close</Button>,
                    <Button onClick={() => { form.submit() }} type="primary">Submit</Button>,
                ]}
            >
                <CommonForm
                    form={form}
                    selectedDonation={addDonation}
                    onFinish={(values) => handleFormSubmit(values, "ADD")}
                    onFinishFailed={handleFormValidation}
                />
            </CommonModal>
        )
    }

    const handleUpdateInvoice = () => {
        updateInvoiceAPI(donationInvoice)
    }

    const renderDeleteConfirmModal = () => {
        return <CommonModal
            open={showDeleteModal}
            title={"Confirm Delete"}
            onCancel={() => handleFormCancel("DELETE")}
            footer={[
                <Button onClick={() => handleFormCancel("DELETE")} >Cancel</Button>,
                <Button
                    className="cancel-button"
                    // className="confirm-button" 
                    onClick={(values) => handleFormSubmit(values, "DELETE")}
                >
                    Confirm
                </Button>
            ]}
        >
            <div>
                <Typography>
                    Are you sure to delete this donation type?
                </Typography>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {deleteDonation?.donationLabel}
                </div>
            </div>
        </CommonModal>
    }

    const renderInvoiceSettings = () => {
        return (
            <div className="divider-align">
                <Divider orientation="left" plain >
                    <span className="demographics-title custom-theme-color font-s18">Invoice Setup</span>
                </Divider>
                <div className="mb-6">
                    <div className='side-menu-title font-s16 mb-2' style={{ fontWeight: "600" }}>Donation Invoice Header : </div>

                    {/* <Divider orientation="left" plain >
                        <span className="demographics-title font-s18">Donation Invoice Header</span>
                    </Divider> */}
                    <Editor
                        type={"header"}
                        donationInvoice={donationInvoice}
                        setDonationInvoice={setDonationInvoice}
                    />
                </div>
                <div className="mt-6 mb-6">
                    {/* <Divider orientation="left" plain >
                        <span className="demographics-title font-s18">Donation Invoice Footer</span>
                    </Divider> */}
                    <div className='side-menu-title font-s16 mb-2' style={{ fontWeight: "600" }}>Donation Invoice Footer : </div>

                    <Editor
                        type={"footer"}
                        donationInvoice={donationInvoice}
                        setDonationInvoice={setDonationInvoice}
                    />
                </div>
                <div className="mb-3">
                    <Button onClick={handleUpdateInvoice}>
                        Update Invoice
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="mh-100">
            <CommonSpinner loading={loading}>

                <div className="pl-3 pr-3 pt-3  settings-divider">
                    <Row className="pb-3" style={{ gap: '10px' }}>
                        <Col>
                            <Button shape="round" type={selectedButton === "DonationType" ? "primary" : "default"} onClick={() => handleButtons("DonationType")} >
                                Donation Type
                            </Button>
                        </Col>
                        <Col>
                            <Button shape="round" type={selectedButton === "InvoiceSetup" ? "primary" : "default"} onClick={() => handleButtons("InvoiceSetup")} >
                                Invoice Setup
                            </Button>
                        </Col>
                    </Row>
                    {!loading && <>
                        {(selectedButton === "DonationType" || selectedButton === "AddDonationType") &&
                            <div className="divider-align ">
                                <Divider orientation="left" plain >
                                    <span className="demographics-title custom-theme-color font-s18">Donations Type</span>
                                </Divider>
                                <Button className="mt-2 mb-2"
                                    onClick={() => {
                                        setShowAddModal(true)
                                    }} >
                                    Add Donation Type
                                </Button>
                                <Table className="pt-3 pb-3" dataSource={donationCategory} columns={donationHeader} size="small" bordered pagination={false} />
                            </div>
                        }
                    </>
                    }
                    {(selectedButton === "DonationType" && showEditModal) && renderEditModal()}
                    {(showAddModal) && renderAddModal()}
                    {showDeleteModal && renderDeleteConfirmModal()}
                    {selectedButton === 'InvoiceSetup' && renderInvoiceSettings()}
                </div>
            </CommonSpinner>
        </div>

    )
}

export default Settings;