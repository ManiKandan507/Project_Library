import React from "react";

const LabelOutside = ({ bars }) => {
    const labelMargin = 10;

    const getLabel = (id, value) => {
        if (id === 'bandwidth') return `${value} GB`
        else if (id === 'user') return `${value} Users`
        else if (id === 'Others') return `${value} Other Files`
        else if (id === 'product views') return `${value} Product ${value > 1 ? 'Views' : 'View'}`
        else if (id === 'Video' || id === 'Image') return `${value} ${id}s`
        return `${value} ${id}`;
    }

    return bars.map((bar) => {
        const {
            key,
            width,
            height,
            x,
            y,
            data: { value, id }
        } = bar;

        return (
            <g key={key} transform={`translate(${x}, ${y - labelMargin})`}>
                <text
                    transform={`translate(${width / 2}, ${height / 328})`}
                    textAnchor="middle"
                    fontSize="14px"
                >
                    {getLabel(id, value)}
                </text>
            </g>
        );
    });
};

export default LabelOutside;