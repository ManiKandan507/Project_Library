import { useState, useContext, useEffect, useMemo } from "react";
import _groupBy from 'lodash/groupBy';
import _isEqual from 'lodash/isEqual';
import _uniqueId from 'lodash/uniqueId';
import { Select } from "semantic-ui-react";
import { useRef } from "react";
import { MenuOutlined, EditOutlined } from '@ant-design/icons';

import MultiSelect from "../../components/MultiSelect";
import { useApi } from "../../hooks/useApi";
import DirectoryContext from "../DirectoryContext";

import ConfirmDialog from "../../components/ConfirmDialog";

const TYPE_OPTIONS = [
  { key: 'group', value: 'group', text: 'Group' },
  { key: 'custom_field', value: 'custom_field', text: 'Custom Field' }
]

const MemberFilters = () => {
  const [loadingGroups, groupMap] = useApi("GROUPS");
  const [loadingCustomFields, customFieldData] = useApi("CUSTOM_FIELDS_DATA");

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [customFieldMap, setCustomFieldMap] = useState({});

  const { editedDirectory, setEditedDirectory } = useContext(DirectoryContext);
  const [filters, setFilters] = useState(editedDirectory.filters ?? []);
  const [facetIdxToRm, setFacetIdxToRm] = useState([-1]);
  const [optionToRm, setOptionToRm] = useState([]);
  const [toggleValues, setToggleValues] = useState([]);
  const [toggleOptionValues, setToggleOptionValues] = useState({});
  const [optionLabel, setOptionLabel] = useState({});
  const [isTextEditable, setTextEditable] = useState({});
  const [isFilterLabelEditable, setIsFilterLabelEditable] = useState({});

  useEffect(() => {
    let mapValues = _groupBy(customFieldData, 'Fieldlabel');
    setCustomFieldMap(mapValues);
  }, [customFieldData]);

  useEffect(() => {
    setFilters(editedDirectory.filters);
  }, [editedDirectory]);

  useEffect(() => {
    setEditedDirectory(dir => ({
      ...dir, filters: filters.map((f, index) => {
        if (!f.orderOf) f.orderOf = index + 1;
        return f
      })
    }));
  }, [!_isEqual(filters, editedDirectory.filters)]);

  if (loadingGroups) return null;
  if (loadingCustomFields) return null;

  const addFilter = () => {
    const orderOf = filters.length === 0 ? 1 : filters[filters.length - 1]?.orderOf + 1;
    setFilters(filters => [
      ...filters,
      { label: "", type: "group", options: [], orderOf },
    ]);
    setToggleValues(values => ([...values, orderOf]))
  };

  const removeFilter = filterIndex => {
    let filteredValue = filters.filter(x => x.orderOf !== filterIndex).map((val, index) => ({ ...val, orderOf: index + 1 }));
    setFilters(filteredValue);
    setToggleValues([]);
    setToggleOptionValues({});
    setOptionLabel({});
  };

  const addFilterOption = (filter) => {
    setToggleOptionValues((prev) => {
      let prevValues = prev[filter.orderOf] || [];
      if (!filter.options.length) {
        return ({ ...prev, [filter.orderOf]: [...prevValues, prevValues.length] });
      }
      return { ...prev, [filter.orderOf]: [...prevValues, filter.options.length] };
    });
    setFilters(filters => {
      const filtersCpy = JSON.parse(JSON.stringify(filters));
      let option = { label: "", groupIds: [], };
      if (filter.type === "custom_field") {
        option = { label: "", db_values: [], };
      }
      return filtersCpy.map((filterValue) => {
        if (filterValue.orderOf === filter.orderOf) return { ...filterValue, options: [...filterValue.options, option] }
        return filterValue
      });
    });
  };

  const removeFilterOption = ([filterIndex, optionIndex]) => {
    setFilters(filters => {
      const filtersCpy = JSON.parse(JSON.stringify(filters));
      filtersCpy[filterIndex].options.splice(optionIndex, 1);
      return filtersCpy;
    });
  };

  const handleChange = (e, key, flag, filterKey) => {
    e.stopPropagation();
    if (flag === 'options') {
      setToggleOptionValues((prev) => {
        if (e.target.open) {
          let prevValues = prev[key] || [];
          return { ...prev, [key]: [...prevValues, filterKey] }
        } else {
          return { ...prev, [key]: prev[key]?.filter((v) => v !== filterKey) }
        }
      })
    } else {
      setToggleValues(values => {
        if (e.target.open) {
          return [...values, key]
        } else {
          return values.filter(v => v !== key)
        }
      })
    }
  }

  const onChangeCustomFieldType = ({ value }, i, id) => {
    setFilters((filter) => {
      let filterCpy = [...filter]
      filterCpy[i].fieldType = value;
      filterCpy[i].options = filterCpy[i].options.map((item) => {
        return { ...item, label: '', db_values: [] }
      })
      return filterCpy;
    });
    setOptionLabel([]);
  }

  const handleSort = () => {
    let filterFacets = [...filters]
    const draggedItemContent = filterFacets.splice(dragItem.current, 1)[0]
    filterFacets.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    const resData = filterFacets.map((filter, idx) => {
      return { ...filter, orderOf: idx + 1 }
    });
    setFilters(resData)
    setToggleValues([]);
    setToggleOptionValues({});
    setOptionLabel({});
  }

  return (
    <>
      <div>
        <h5 className="form-header">Filters</h5>
        <p className="form-subtitle">
          Filter options to be shown at the sidebar.
        </p>
      </div>
      <div className="form-field">
        <div>
          {filters?.map((filter, i) => (
            <details
              key={i}
              open={toggleValues.includes(filter.orderOf)}
              onToggle={(e) => handleChange(e, filter.orderOf, 'filters')}
            >
              <summary
                onDragStart={() => dragItem.current = i}
                onDragEnter={() => dragOverItem.current = i}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleSort}
              >
                <span style={{ paddingLeft: "1rem" }}>
                  <span
                    draggable
                    style={{ cursor: 'move' }}
                  >
                    <MenuOutlined />&nbsp;&nbsp;
                  </span>
                  {!isFilterLabelEditable[filter.orderOf] ? (
                    <>
                      <span>
                        {filter.label || "Untitled Filter"}&nbsp;&nbsp;
                      </span>
                      <span onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsFilterLabelEditable(prev => ({ ...prev, [filter.orderOf]: true }))
                      }}><EditOutlined /></span>
                    </>
                  ) : (
                    <input
                      type="text"
                      placeholder="Filter Label"
                      value={filter.label}
                      style={{ height: '2rem', width: '50%', display: 'inline' }}
                      onBlur={() => setIsFilterLabelEditable(prev => ({ ...prev, [filter.orderOf]: false }))}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setIsFilterLabelEditable(prev => ({ ...prev, [filter.orderOf]: false }))
                        }
                      }}
                      onChange={e =>
                        setFilters(filters => {
                          const filtersCpy = [...filters];
                          filtersCpy[i].label = e.target.value;
                          return filtersCpy;
                        })
                      }
                    />
                  )}
                </span>
                <i
                  onClick={e => {
                    e.preventDefault();
                    setFacetIdxToRm([filter.orderOf, filter.label]);
                  }}
                  style={{ fontSize: "1rem", float: "right" }}
                  className="trash icon remove-button"
                ></i>
              </summary>

              <div className="filter-content">
                <label htmlFor="filter-type">Type</label>
                <Select
                  selection
                  style={{ fontSize: "1.3rem", width: '100%' }}
                  size="large"
                  scrolling
                  className="filter-input"
                  options={TYPE_OPTIONS}
                  onChange={(_, e) => {
                    setFilters(filters => {
                      const filtersCpy = [...filters];
                      filtersCpy[i].type = e.value;
                      filtersCpy[i]?.options.splice(0, filtersCpy[i]?.options.length);
                      return filtersCpy;
                    })
                    setToggleOptionValues((prev) => ({ ...prev, [filter.orderOf]: [] }));
                  }}
                  value={filter.type}
                />
                {filter.type === 'custom_field' && <>
                  <label style={{ marginTop: '0.5rem' }} htmlFor="filter-type">Field Type</label>
                  <Select
                    selection
                    style={{ fontSize: "1.3rem", width: '100%' }}
                    size="large"
                    scrolling
                    placeholder="Please Select a Field"
                    className="filter-input"
                    options={Object.keys(customFieldMap).map((key, index) => ({
                      key: index, value: key, text: key
                    }))}
                    onChange={(_, e) => onChangeCustomFieldType(e, i, filter.orderOf)}
                    value={filter.fieldType}
                  />
                </>}
                <label style={{ marginBottom: ".75em" }}>Options</label>
                {filter.options.map((option, j) => {
                  return (
                    <details key={j} style={{ marginBottom: ".5em" }}
                      open={toggleOptionValues[filter.orderOf]?.includes(j)}
                      onToggle={(e) => handleChange(e, filter.orderOf, 'options', j)}
                    >
                      <summary style={{ fontSize: "1rem" }}>
                        {isTextEditable[`${filter.orderOf}_${j}`] ? (
                          <span>
                            <input
                              type="text"
                              placeholder="Option Label"
                              value={option.label}
                              style={{ height: '2rem', width: '50%', display: 'inline' }}
                              onBlur={() => setTextEditable((prev) => ({ ...prev, [`${filter.orderOf}_${j}`]: false }))}
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  setTextEditable((prev) => ({ ...prev, [`${filter.orderOf}_${j}`]: false }))
                                }
                              }}
                              onChange={e => {
                                setFilters(filters => {
                                  const filtersCpy = [...filters];
                                  filtersCpy[i].options[j].label = e.target.value;
                                  return filtersCpy;
                                })
                              }}
                            />
                          </span>
                        ) : (
                          <>
                            <span style={{ paddingLeft: "1rem" }}>
                              {option.label || "Untitled Option"}&nbsp;&nbsp;
                            </span>
                            <span onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setTextEditable((prev) => ({ ...prev, [`${filter.orderOf}_${j}`]: true }))
                            }}><EditOutlined />
                            </span>
                          </>
                        )}
                        <i
                          onClick={e => {
                            e.preventDefault();
                            setOptionToRm([i, j, option.label]);
                          }}
                          style={{ fontSize: "1rem", float: "right" }}
                          className="times icon remove-button"
                        ></i>
                      </summary>

                      <div
                        className="filter-content"
                        style={{ paddingTop: ".5em" }}
                      >
                        {filter.type === 'custom_field' ? <div>
                          <div>
                            {Object.keys(customFieldMap).filter((key) => key === filter.fieldType)
                              .map(fieldKey => {
                                let currentFieldMap = customFieldMap[fieldKey];
                                let currentField = currentFieldMap.length ? currentFieldMap[0] : {};
                                let currentDBValue = option?.db_values?.find(db => db.key === currentField.FieldContentType) || { values: [] }
                                return (
                                  <div className="nested-custom-field">
                                    <MultiSelect
                                      optionMap={[...currentFieldMap.map(({ rowvalue, ValueID }) => ({
                                        id: ValueID,
                                        label: rowvalue,
                                      }))]}
                                      selectedIds={currentDBValue.values ?? []}
                                      onChange={(values, label, id) => {
                                        let currentOptionLabelData = [...(optionLabel[filters[i]?.orderOf] || [])];
                                        let currentOptionLabel = currentOptionLabelData.find(obj => obj.id === id && obj.index === j) || {};
                                        setFilters(filters => {
                                          const filtersCpy = [...filters];
                                          let tempDBValues = filtersCpy[i].options[j].db_values ?? [];
                                          let resDBValues = [];
                                          if (tempDBValues?.find(db => db.key === currentField.FieldContentType)) {
                                            resDBValues = tempDBValues.map(db => {
                                              if (db.key === currentField.FieldContentType) {
                                                return { ...db, values: [...values] }
                                              }
                                              return { ...db }
                                            });
                                          } else {
                                            resDBValues = tempDBValues;
                                            resDBValues?.push({
                                              key: currentField.FieldContentType,
                                              values: [...values]
                                            });
                                          }
                                          filtersCpy[i].options[j].db_values = resDBValues?.filter(val => val.values.length) ?? [];
                                          if (values.includes(id)) {
                                            if ((!(filtersCpy[i].options[j]?.label?.length)) || (filtersCpy[i].options[j].label === label)) {
                                              filtersCpy[i].options[j].label = label;
                                              currentOptionLabelData.push({ index: j, id, label, selected: true });
                                            } else {
                                              currentOptionLabelData.push({ index: j, id, label, selected: false });
                                            }
                                          } else if (!values.includes(id)) {
                                            currentOptionLabelData = [...currentOptionLabelData].filter((obj) => !(obj.index === j && obj.id === id));
                                            // if (filtersCpy[i].options[j].label === label && currentOptionLabel.selected) {
                                            if (filtersCpy[i].options[j].label === label) {
                                              let currentIndexData = currentOptionLabelData.filter(obj => obj.index === j)
                                              if (currentIndexData?.length) {
                                                filtersCpy[i].options[j].label = currentIndexData[0].label;
                                                currentOptionLabelData = [...currentOptionLabelData].map(opt => {
                                                  if (opt.id === currentIndexData[0].id && opt.index === currentIndexData[0].index) {
                                                    return { ...opt, selected: true }
                                                  }
                                                  return opt
                                                });
                                              } else {
                                                filtersCpy[i].options[j].label = '';
                                              }
                                            }
                                          }
                                          return filtersCpy;
                                        });
                                        setOptionLabel(prev => {
                                          let temp = { ...prev }
                                          if (!temp[filters[i].orderOf]) temp[filters[i].orderOf] = [];
                                          temp[filters[i].orderOf] = currentOptionLabelData;
                                          return temp
                                        });
                                      }}
                                    />
                                  </div>
                                )
                              })}
                          </div>
                        </div> : null}
                        {filter.type === 'group' && <MultiSelect
                          optionMap={[...groupMap.entries()].map(
                            ([id, group]) => ({
                              id,
                              label: group.label,
                            })
                          )}
                          selectedIds={option.groupIds}
                          onChange={(groupIds, label, id) => {
                            setFilters(filters => {
                              const filtersCpy = [...filters];
                              filtersCpy[i].options[j].groupIds = [...groupIds];
                              const groupField = Array.from(groupMap).map(([id, group]) => ({
                                id: id,
                                label: group.label
                              })).filter((val) => groupIds.includes(val.id));
                              if (!(filtersCpy[i].options[j]?.label?.length) && groupIds.includes(id)) {
                                filtersCpy[i].options[j].label = label;
                              } else if (filtersCpy[i].options[j]?.label === label && !groupIds.includes(id)) {
                                filtersCpy[i].options[j].label = '';
                                if (groupField.length) {
                                  filtersCpy[i].options[j].label = groupField[0].label;
                                }
                              }
                              return filtersCpy;
                            });
                          }}
                        />}
                      </div>
                    </details>
                  )
                }
                )}

                <button
                  onClick={e => {
                    e.preventDefault(); // fix reload issue
                    addFilterOption(filter);
                  }}
                  className="card-line-add"
                >
                  Add Option +
                </button>
              </div>
            </details>
          )
          )}
        </div>

        <button
          onClick={e => {
            e.preventDefault(); // fix reload issue
            addFilter();
          }}
          className="card-line-add"
        >
          Add New Filter +
        </button>
      </div>
      {facetIdxToRm[0] >= 0 && (
        <ConfirmDialog
          prompt={`Remove ${!facetIdxToRm[1].length ? "Untitled Filter" : facetIdxToRm[1]} Filter ?`}
          okayText={"Yes"}
          cancelText={"No"}
          onCancel={() => setFacetIdxToRm([-1])}
          onConfirm={() => (removeFilter(facetIdxToRm[0]), setFacetIdxToRm([-1]))}
        />
      )}
      {optionToRm.length > 0 && (
        <ConfirmDialog
          okayText={"Yes"}
          cancelText={"No"}
          prompt={`Remove ${!optionToRm[2].length ? "Untitled Filter" : optionToRm[2]} option ?`}
          onCancel={() => setOptionToRm([])}
          onConfirm={() => (removeFilterOption(optionToRm), setOptionToRm([]))}
        />
      )}
    </>
  );
};

export default MemberFilters;
