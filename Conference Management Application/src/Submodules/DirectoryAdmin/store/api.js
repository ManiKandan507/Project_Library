import { toFrontendDirectory } from "../helpers";

export const domainUrl = process.env.REACT_APP_API_URL;

export default [
  {
    id: "DIRECTORIES",
    initialValue: [],
    reducer: (state, payload) => payload.data.map(toFrontendDirectory),
    endpoint: appDir =>
      `${domainUrl}?appdir=${appDir}&module=directory&component=member_directory&function=all_directories`,
  },
  {
    id: "MEMBER_TYPES",
    initialValue: new Map(),
    reducer: (state, payload) =>
      new Map(
        payload.data.map(member => [member.MemberTypeID, member.MemberTypeName])
      ),
    endpoint: appDir =>
      `${domainUrl}?appdir=${appDir}&module=directory&component=member_directory&function=company_member_types`,
  },
  {
    id: "GROUPS",
    initialValue: new Map(),
    reducer: (state, payload) =>
      new Map(
        payload.data.map(group => [
          group.GroupID,
          { label: group.GroupName, uuid: group.GroupHexID },
        ])
      ),
    endpoint: appDir =>
      `${domainUrl}?appdir=${appDir}&module=directory&component=member_directory&function=contact_groups`,
  },
  {
    id: "TAG_CATEGORIES",
    initialValie: new Map(),
    reducer: (state, payload) =>
      new Map(payload.data.map(cat => [cat.catid, cat.label])),
    endpoint: appDir =>
      `${domainUrl}?appdir=${appDir}&module=directory&component=member_directory&function=company_tag_categories`,
  },
  {
    id: "CUSTOM_FIELDS",
    initialValie: [],
    reducer: (state, payload) => {
      const customFields = payload.customFields.map(field => ({
        id: field.FieldID,
        type: field.FieldType,
        contentType: field.FieldContentType,
        label: field.Fieldlabel,
      }));
      return customFields;
    },
    endpoint: appDir =>
      `${domainUrl}?appdir=${appDir}&module=directory&component=member_directory&function=company_custom_fields`,
  },
  {
    id: "CUSTOM_FIELDS_DATA",
    initialValie: [],
    reducer: (state, payload) => {
      return payload.data;
    },
    endpoint: appDir => {
    return `${domainUrl}?appdir=${appDir}&module=client&component=member_directory&function=get_custom_fields&conferenceid=${0}`
    }
  },
];
