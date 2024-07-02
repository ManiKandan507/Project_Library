import { useEffect,useMemo } from 'react';
import { Input, Form } from 'antd';
import { Select } from "semantic-ui-react";

const FilterRegion = ({
    options = [],
    onChange = () => { },
    editedDirectory = {},
    onChangeInput = () => { }
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            country_label: editedDirectory?.coreFilter?.country_label,
            company_label: editedDirectory?.coreFilter?.company_label,
            world_region_label: editedDirectory?.regionFilter?.world_region_label,
            america_region_label: editedDirectory?.regionFilter?.america_region_label,
            city_label: editedDirectory?.coreFilter?.city_label
        });
    }, [form, editedDirectory?.regionFilter, editedDirectory?.coreFilter])

    const filterData = [
        {
            label: "Country",
            fieldKey: "coreFilter",
            selectOnchange: 'show_country',
            value: editedDirectory.coreFilter?.show_country,
            name: "country_label",
            required: true,
            message: 'Please input country label!',
            inputValue: editedDirectory?.coreFilter?.country_label,
        },
        {
            label: "Company",
            fieldKey: "coreFilter",
            selectOnchange: 'show_company',
            value: editedDirectory?.coreFilter?.show_company,
            name: "company_label",
            required: true,
            message: 'Please input company label!',
            inputValue: editedDirectory?.coreFilter?.company_label,
        },
        {
            label: "City",
            fieldKey: "coreFilter",
            selectOnchange: 'show_city',
            value: editedDirectory.coreFilter?.show_city,
            name: "city_label",
            required: true,
            message: 'Please input city label!',
            inputValue: editedDirectory?.coreFilter?.city_label,
        },
        {
            label: "World Region",
            fieldKey: "regionFilter",
            selectOnchange: 'show_world_region',
            value: editedDirectory?.regionFilter?.show_world_region,
            name: "world_region_label",
            required: true,
            message: 'Please input world region label!',
            inputValue: editedDirectory?.regionFilter?.world_region_label,
        },
        {
            label: "America Region",
            fieldKey: "regionFilter",
            selectOnchange: 'show_america_region',
            value: editedDirectory.regionFilter?.show_america_region,
            name: "america_region_label",
            required: true,
            message: 'Please input america region label!',
            inputValue: editedDirectory?.regionFilter?.america_region_label,
        },
    ]

    const filterValues = useMemo(() => {
        let member = [];
        if (editedDirectory.type === "company") {
             member = filterData.filter((item) => item.label !== "Company")
        } else {
            member = [...filterData]
        }
        return member;
    }, [filterData, editedDirectory])

    return (
        <Form
            form={form}
            name="Region_filter"
            className='directory-form region-form'
        >
            {filterValues?.map((item) => {
                return (
                    <>
                        <div>
                            <h5 className="form-header">{item?.label}</h5>
                        </div>
                        <div className="flex form-field" style={{ gap: "2em" }}>
                            <div>
                                <h5
                                    className="form-header"
                                    style={{ marginBottom: ".5em", fontSize: "1em", marginLeft: "1em" }}
                                >
                                    Field
                                </h5>
                                <Select
                                    placeholder='Select Yes/No'
                                    selection
                                    style={{ fontSize: "1.3rem" }}
                                    size="large"
                                    scrolling
                                    options={options}
                                    onChange={(_, e) => onChange(e, item?.selectOnchange, item?.fieldKey)}
                                    value={item?.value ? 'yes' : 'no'}
                                />
                            </div>
                            {item?.value ? <div>
                                <h5
                                    className="form-header"
                                    style={{ marginBottom: ".5em", fontSize: "1em", marginLeft: "1em" }}
                                >
                                    Label
                                </h5>
                                <Form.Item
                                    name={item?.name}
                                    rules={[
                                        {
                                            required: item?.required,
                                            message: item?.message,
                                        },
                                    ]}
                                    value={item?.inputValue}
                                >
                                    <Input
                                        onChange={(e) => onChangeInput(e, item?.name, item?.fieldKey)}
                                    />
                                </Form.Item>
                            </div> : null}
                        </div>
                    </>
                )
            })}
        </Form>
    )
}

export default FilterRegion;