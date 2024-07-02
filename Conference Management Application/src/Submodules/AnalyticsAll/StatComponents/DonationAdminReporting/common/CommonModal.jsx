import Modal from 'antd/lib/modal/Modal';
import React from 'react'

const CommonModal = (props) => {
    const { children,...rest } = props;
    return (<Modal {...rest}>{children}</Modal>)
}

export default CommonModal;