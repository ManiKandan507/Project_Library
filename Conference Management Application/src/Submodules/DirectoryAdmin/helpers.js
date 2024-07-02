export const toFrontendDirectory = directory => {
  const config = JSON.parse(directory.ConfigJSON) ?? "";
  let groupId = directory?.GroupIDList?.split(",").map((id)=>{
    return {id:Number(id), color:'#000113'}
  })
  let cardHeader = [];
  let cardBody = [];
  let cardPopup = []

  if (config?.card_lines) {
    const matches = config.card_lines.name_line.matchAll(/\[(\w+)\]/g);
    cardHeader = [...matches].map(([, captured]) => captured);
    cardBody = config.card_lines.lines.map(line => {
      const matches = line.matchAll(/\[(\w+)\]/g);
      return [...matches].map(([, captured]) => captured);
    });
  }

  if(config?.card_lines?.popup_fields){
    const fields = config?.card_lines?.popup_fields?.matchAll(/\[(\w+)\]/g);
    cardPopup = [...fields].map(([, captured])=> captured)
  }

  return {
    id: directory.DirectoryID,
    uuid: directory.DirectoryUUID,
    type: directory.directory_type === "compid" ? "company" : "member",
    name: directory.DirectoryName,
    description: directory.DescriptionText ?? "",
    dateAdded: directory.DateAdded,
    lastUpdated: directory.LastUpdated,
    validExpiryRequired: !!config.valid_expiry_required,
    themeColor: {
      primary: config.style?.primary_color ?? "#fff",
      light: config.style?.light_color ?? "#fff",
      dark: config.style?.dark_color ?? "#fff",
    },
    horizontalCarousel: config.horizontal_carousel,
    config, // not necessary, for debugging
    GroupIDLists:groupId ?? [], 
    // company only
    memberTypes:
      config.member_types?.map(type => ({
        id: parseInt(type.MemberTypeID),
        color: type.color,
      })) ?? [],
    tagCategoryIds: config.tag_category_id ?? [],
    showMemberType: !config.hide_member_type,
    showMedia: !config.hide_media,
    customFieldTypes: config.include_customfields ?? [],
    customFieldIdAssert: config.custom_field_assert ?? -1,
    customValueIdAssert: config.custom_value_assert ?? -1,

    // member only
    groups:
      config?.GroupIDList?.map(group => ({
        id: group.id,
        color: group.color,
      })) ?? [],
    ribbons:
      config.RibbonIDList?.map(ribbon => ({
        label: ribbon.label,
        color: ribbon.color,
        groupIds: ribbon.GroupIDList ?? [],
      })) ?? [],
    filters: config?.filters_config ?? [],
    optional_directory_visibility: config?.optional_directory_visibility ?? [],
    optional_directory_visibility_local: config?.optional_directory_visibility ?? [],
    modalGroups: config.groups_in_modal_config ?? [],
    card: {
      header: cardHeader,
      body: cardBody,
      popup: cardPopup
    },
    publicAccess: config.public_access,
    publicAccessGroupIds: config.public_access_group_ids ?? [],
    // isMiniDirectory: config.is_mini_directory,
    hide_fields:config.hide_fields,
    messaging_config: config?.messaging_config ?? {
      ...config.messaging_config,
      enabled: false,
    },
    hide_config: config?.hide_config ?? {
      ...config.hide_config,
      enabled: false,
    },
    contact_config: {
      ...config.contact_config,
      show_email: config.contact_config?.show_email ?? false,
      show_phone: config.contact_config?.show_phone ?? false,
    },
    regionFilter: {
      show_world_region: config?.region_filter?.world_region?.enabled,
      world_region_label: config?.region_filter?.world_region?.label,
      show_america_region: config?.region_filter?.america_region?.enabled,
      america_region_label: config?.region_filter?.america_region?.label,
    },
    coreFilter: {
      show_country: config?.core_filter?.country?.enabled,
      country_label: config?.core_filter?.country?.label,
      show_company: config?.core_filter?.company?.enabled,
      company_label: config?.core_filter?.company?.label,
      show_city: config?.core_filter?.city?.enabled ?? false,
      city_label: config?.core_filter?.city?.label ?? 'Location',
    }
  };
};

export const toBackendDirectory = directory => {
  const companyConfig = directory.type === "company" && {
    hide_member_type: !directory.showMemberType,
    hide_media: !directory.showMedia,
    member_types: directory.memberTypes.map(type => ({
      MemberTypeID: type.id,
      color: type.color,
    })),
    tag_category_id: directory.tagCategoryIds,
    include_customfields: directory.customFieldTypes,
    custom_field_assert: directory.customFieldIdAssert,
    custom_value_assert: directory.customValueIdAssert,
  };
  const memberConfig = directory.type === "member" && {
    GroupIDList: directory.groups.map(({ id, color }) => ({ id, color })),
    RibbonIDList:
      directory.ribbons.map(ribbon => ({
        label: ribbon.label,
        color: ribbon.color,
        GroupIDList: ribbon.groupIds,
      })) ?? [],
    filters_config: directory.filters,
    optional_directory_visibility: directory?.optional_directory_visibility_local.map(({id,...rest})=> rest),
    optional_directory_visibility_local: directory?.optional_directory_visibility_local,
    groups_in_modal_config: directory.modalGroups,
    card_lines: {
      name_line: directory.card?.header.map(item => `[${item}]`).join("") ?? "",
      lines:
        directory.card?.body.map(line =>
          line.map(item => `[${item}]`).join("")
        ) ?? [],
      popup_fields: directory.card?.popup.map(item => `[${item}]`).join("") ?? "",
    },
    public_access: directory.publicAccess,
    public_access_group_ids: directory.publicAccessGroupIds,
    // is_mini_directory: directory.isMiniDirectory,
    hide_fields: directory.hide_fields,
    messaging_config: { ...directory.messaging_config },
    hide_config:{...directory.hide_config },
    contact_config: {
      ...directory.contact_config,
      show_email: directory.contact_config.show_email,
      show_phone: directory.contact_config.show_phone,
    },
  };

  return {
    DirectoryID: directory.id,
    DirectoryName: directory.name,
    DescriptionText: directory.description,
    ConfigJSON: JSON.stringify({
      ...directory.config,
      valid_expiry_required: directory.validExpiryRequired,
      horizontal_carousel:directory.horizontalCarousel,
      style: {
        primary_color: directory.themeColor.primary,
        light_color: directory.themeColor.light,
        dark_color: directory.themeColor.dark,
      },
      region_filter: {
        world_region: {
          label: directory.regionFilter?.world_region_label,
          enabled: directory.regionFilter?.show_world_region
        },
        america_region: {
          label: directory.regionFilter?.america_region_label,
          enabled: directory.regionFilter?.show_america_region
        },
      },
      core_filter: {
        company: {
          label: directory?.coreFilter?.company_label,
          enabled: directory?.coreFilter?.show_company
        },
        country: {
          label: directory?.coreFilter?.country_label,
          enabled: directory?.coreFilter?.show_country
        },
        city: {
          label: directory?.coreFilter?.city_label,
          enabled: directory?.coreFilter?.show_city
        }
      },
      ...companyConfig,
      ...memberConfig,
    }),
  };
};

export const capitalize = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const generateRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;
