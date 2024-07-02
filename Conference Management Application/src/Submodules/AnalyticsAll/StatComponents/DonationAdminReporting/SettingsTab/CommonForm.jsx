import React from "react";
import { Form, Input } from "antd";

const CommonForm = ({
    form,
    selectedDonation,
    onFinish,
    onFinishFailed
}) => {

    return (
        <>
            <Form
                form={form}
                name="basic"
                labelAlign="left"
                fields={[
                    {
                        name: 'donation_label',
                        value: selectedDonation.donation_label,
                    }, {
                        name: 'external_product_code',
                        value: selectedDonation.external_product_code,
                    }
                ]}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="Donation Label :"
                    name="donation_label"
                    rules={[
                        {
                            required: true,
                            message: "required"
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="External Product Code :"
                    name="external_product_code"
                    rules={[
                        {
                            required: true,
                            message: "required"
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </>
    )
}

export default CommonForm;