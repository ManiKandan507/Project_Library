/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Drawer, Button, Result, Steps, Alert } from "antd";
import { LoadingOutlined, CheckCircleOutlined } from "@ant-design/icons";
import "./custom.css";
import {
  requestSessionAbstractConfig,
  requestAddProducts,
  requestFetchAddProductCategory,
  requestAddProductPricingAndAccess,
  requestAddRelation,
  requestPerformRollback,
  requestStopMigration,
  requestCloneForm,
  requestFixFileSize,
  requestStoreWizardConfig,
} from "../../appRedux/actions/Wizard";
import _, { isArray, isEmpty } from "lodash";
import moment from "moment";
const { Step } = Steps;
const { v4: uuidv4 } = require("uuid");
const ExecuteMigration = props => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(true);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [fetchingSessionAbstractConfig, setFetchingSessionAbstractConfig] =
    useState(false);
  const [
    isConferenceProductCreateInProgress,
    setIsConferenceProductCreateInProgress,
  ] = useState(false);
  const [
    isConferencePricingCreateInProgress,
    setIsConferencePricingCreateInProgress,
  ] = useState(false);
  const [
    isSessionProductCreateInProgress,
    setIsSessionProductCreateInProgress,
  ] = useState(false);
  const [
    isSessionProductPricingCreateInProgress,
    setIsSessionProductPricingCreateInProgress,
  ] = useState(false);

  const stateExecuteMigration = useSelector(
    state => state.wizard.execute_migration
  );

  const stateConfig = useSelector(state => state.wizard.config);
  const globalStatus = useSelector(
    state => state.wizard.execute_migration.global_status
  );
  const stateSessionConfigs = useSelector(
    state => state.wizard.execute_migration.session_configs
  );
  const stateAbstractConfigs = useSelector(
    state => state.wizard.execute_migration.abstract_configs
  );
  const sellSession = stateConfig.sell_session === "true" ? true : false;

  const sellAbstract = stateConfig.sell_abstract === "true" ? true : false;

  const [createCustomBundle] = useState(
    stateConfig.create_custom_bundle === "true" ? true : false
  );

  const [doNotCreateProductSessionIDs] = useState(() => {
    if (createCustomBundle) {
      let sessionIDs = [];
      stateConfig.custom_bundles.forEach(bundle => {
        bundle.sessions.forEach(session => {
          if (
            session.do_not_create_product &&
            !sessionIDs.includes(parseInt(session.id))
          ) {
            sessionIDs.push(parseInt(session.id));
          }
        });
      });

      return sessionIDs;
    } else {
      return [];
    }
  });

  const wizardState = useSelector(state => state.wizard);

  // Step 1: Getting product configs
  useEffect(() => {
    // Pre fetch the configs of session and abstracts
    if (
      !globalStatus.session_configs_fetched &&
      !globalStatus.abstract_configs_fetched &&
      !fetchingSessionAbstractConfig
    ) {
      const sessionIDs = stateConfig.session_list.map(
        session => session.SessionID
      );

      let includeCredits = [];
      let includeEvaluation = [];
      stateConfig.evaluations.forEach(evalu => {
        if (evalu.showEvaluation && evalu.includeEvaluation) {
          if (
            evalu.showCredits &&
            evalu.includeCredit &&
            stateConfig.credits.length > 0
          ) {
            includeCredits.push(parseInt(evalu.SessionID));
          }

          includeEvaluation.push(parseInt(evalu.SessionID));
        }
      });

      let abstractIDs = [];
      for (const abstractsItr in stateConfig.abstracts) {
        stateConfig.abstracts[abstractsItr].forEach(abstract => {
          abstractIDs.push(abstract.ID);
        });
      }
      dispatch(
        requestSessionAbstractConfig({
          sourceHex: props.sourceHex,
          body: {
            copy_tags: stateConfig.abstract_tag === "true" ? true : false,
            abstract_fields: stateConfig.abstract_fields,
          },
          sessionIDs,
          abstractIDs,
          includeCredits,
          includeEvaluation,
        })
      );
      setFetchingSessionAbstractConfig(true);
    }
    if (
      globalStatus.session_configs_fetched &&
      globalStatus.abstract_configs_fetched
    ) {
      setFetchingSessionAbstractConfig(false);
    }

    if (!globalStatus.product_category_fetched) {
      dispatch(
        requestFetchAddProductCategory({
          sourceHex: props.sourceHex,
          ConfID: stateConfig.store.ConfID,
          label: stateConfig.menu.Button,
        })
      );
    }
  }, [
    globalStatus.abstract_configs_fetched,
    globalStatus.session_configs_fetched,
    globalStatus.product_category_fetched,
  ]);

  // Step 2: Migrating conference Product
  // Sub step 1: Create conference product
  useEffect(() => {
    //Assuming the default as Open/Free access
    let defaultConferencePrice = 0;
    stateConfig.conference_pricing.every(pricing => {
      if (pricing.scope === "public") {
        defaultConferencePrice = parseInt(pricing.price);
        return false;
      }
      return true;
    });

    if (
      globalStatus.processed_conference_products.length === 0 &&
      globalStatus.abstract_configs_fetched &&
      globalStatus.session_configs_fetched &&
      globalStatus.product_category_fetched &&
      // defaultConferencePrice >= 0 &&
      !globalStatus.performRollback &&
      !isConferenceProductCreateInProgress
    ) {
      console.log("Step 2.1");
      //No conference product created and user selected to sell the conference
      setIsConferenceProductCreateInProgress(true);
      dispatch(
        requestAddProducts({
          sourceHex: props.sourceHex,
          type: "conference",
          type_ids: [stateConfig.conference.ConferenceID],
          products: [
            {
              ProductUUID: uuidv4(),
              LastUpdatedBy: 0,
              ProductLabel: stateConfig.conference.Confname,
              ConfigJSON: JSON.stringify({
                ConferenceID: stateConfig.conference.ConferenceID,
                description: stateConfig.conference.Conf_description,
                image_url:
                  stateConfig.conference.image_url ??
                  stateConfig.conference.header_image ??
                  "",
              }),
              Product_CategoryID: stateExecuteMigration.product_category_id,
              DefaultPrice: defaultConferencePrice,
              DigitalGood: 1,
              ProductNote: "",
              Hidden: 0,
              AutoRenew: 0,
              Internal_KeyID: 0,
              publication_date: stateConfig.conference?.Conf_StartDate
                ? moment(stateConfig.conference.Conf_StartDate).format(
                    "DD/MM/YYYY"
                  )
                : "",
            },
          ],
        })
      );
    }
  }, [
    globalStatus.processed_conference_products,
    globalStatus.abstract_configs_fetched,
    globalStatus.session_configs_fetched,
  ]);

  // Step 2: Migrating conference Product
  // Sub step 2: Create conference product Pricing and product access
  useEffect(() => {
    //Adding conference pricing and conference access
    if (
      globalStatus.processed_conference_products.length === 1 &&
      globalStatus.abstract_configs_fetched &&
      globalStatus.session_configs_fetched &&
      globalStatus.product_category_fetched &&
      stateExecuteMigration.conference_product.product_created &&
      !stateExecuteMigration.conference_product.product_pricing_created &&
      !globalStatus.performRollback &&
      !isConferencePricingCreateInProgress
    ) {
      console.log("Step 2.2");
      setIsConferenceProductCreateInProgress(false);
      setIsConferencePricingCreateInProgress(true);
      //Conference product has been create but not the pricing/product access
      // Default priceRequest for conference
      let pricingRequest = [
        {
          button: stateConfig.menu.Button,
          Fieldlabel: stateConfig.conference.Confname,
          Rowlabel: `${stateConfig.conference.Confname}`,
          ProductID: stateExecuteMigration.conference_product.product_id,
          Price: -1,
          ConfID: stateConfig.store.ConfID,
        },
      ];
      let accessRequest = [];

      stateConfig.conference_pricing.forEach(pricing => {
        if (pricing.scope === "public") {
          if (parseInt(pricing.price) === 0) {
            //Free conference
            wizardState.conference_pricing.contact_groups.forEach(
              contactGroup => {
                accessRequest.push({
                  ProductID:
                    stateExecuteMigration.conference_product.product_id,
                  source: "Migration",
                  rel_type: "group_id",
                  rel_id: contactGroup.GroupID,
                });
              }
            );
          } else if (parseInt(pricing.price) === -1) {
            //The conference is not for Sales. Do Nothing.
          } else if (parseInt(pricing.price) > 0) {
            //Paid conference
            pricingRequest.push({
              button: stateConfig.menu.Button,
              Fieldlabel: stateConfig.conference.Confname,
              Rowlabel: pricing.price_label
                ? `${stateConfig.conference.Confname} (${pricing.price_label})`
                : `${stateConfig.conference.Confname}`,
              ProductID: stateExecuteMigration.conference_product.product_id,
              Price: pricing.price,
              ConfID: stateConfig.store.ConfID,
            });
          }
        }
        if (pricing.scope === "attendee") {
          if (parseInt(pricing.price) === 0) {
            //Free for attendees
            pricing.attendees.forEach(attendee => {
              accessRequest.push({
                ProductID: stateExecuteMigration.conference_product.product_id,
                source: "Migration",
                rel_type: "attendee_value_id",
                rel_id: attendee.ValueID,
              });
            });
          } else if (parseInt(pricing.price) === -1) {
            //Do nothing as this case wont come.
            console.error(
              "Conference -> Attendee-> Not for Sale (Pricing). This should not happen"
            );
          } else if (parseInt(pricing.price) > 0) {
            //This should not happen
            console.error("Conference with Paid type for Attendee selected.");
          }
        }
        if (pricing.scope === "group") {
          if (parseInt(pricing.price) === 0) {
            //Free for groups
            pricing.groups.forEach(group => {
              accessRequest.push({
                ProductID: stateExecuteMigration.conference_product.product_id,
                source: "Migration",
                rel_type: "group_id",
                rel_id: group.GroupID,
              });
            });
          } else if (parseInt(pricing.price) === -1) {
            //Not for sale for specific groups
            const groups = pricing.groups.map(group => group.GroupID);

            pricingRequest.push({
              button: stateConfig.menu.Button,
              Fieldlabel: stateConfig.conference.Confname,
              Rowlabel: pricing.price_label
                ? `${stateConfig.conference.Confname} (${pricing.price_label})`
                : `${stateConfig.conference.Confname}`,
              ProductID: stateExecuteMigration.conference_product.product_id,
              ThisHideFromGroup: groups.toString(),
              Price: pricing.price,
              ConfID: stateConfig.store.ConfID,
            });
          } else if (parseInt(pricing.price) > 0) {
            //Paid for groups
            const groups = pricing.groups.map(group => group.GroupID);

            pricingRequest.push({
              button: stateConfig.menu.Button,
              Fieldlabel: stateConfig.conference.Confname,
              Rowlabel: pricing.price_label
                ? `${stateConfig.conference.Confname} (${pricing.price_label})`
                : `${stateConfig.conference.Confname}`,
              ProductID: stateExecuteMigration.conference_product.product_id,
              ThisShowToGroup: groups.toString(),
              Price: pricing.price,
              ConfID: stateConfig.store.ConfID,
            });
          }
        }
      });

      dispatch(
        requestAddProductPricingAndAccess({
          sourceHex: props.sourceHex,
          type: "conference",
          type_ids: [stateConfig.conference.ConferenceID],
          pricing: pricingRequest,
          access: accessRequest,
        })
      );
    }
  }, [
    globalStatus.processed_conference_products,
    globalStatus.abstract_configs_fetched,
    globalStatus.session_configs_fetched,
    stateExecuteMigration.conference_product,
  ]);

  // Step 3: Migrating session product
  // Sub step 1: Create session and abstract products
  useEffect(() => {
    if (
      stateExecuteMigration.conference_product?.product_created &&
      stateExecuteMigration.conference_product?.product_pricing_created &&
      globalStatus.processed_session_products.length === 0 &&
      !globalStatus.performRollback &&
      !isSessionProductCreateInProgress
    ) {
      console.log("Step 3.1");
      setIsConferencePricingCreateInProgress(false);
      setIsSessionProductCreateInProgress(true);
      //Conference Product, Pricing, Access has been created and No session product has been created
      //Create the session product and abstract product(if selected)
      let sessionProductRequest = [];
      let sessionIDs = [];
      let abstractProductRequest = [];
      let abstractIDs = [];
      let defaultSessionPrice = 0;
      let defaultAbstractPrice = 0;
      let publicSpecialPricingMap = {};
      stateConfig.session_pricing.every(pricing => {
        if (
          pricing.scope === "public" &&
          (isEmpty(pricing.sessions) || !pricing.hasOwnProperty("sessions"))
        ) {
          defaultAbstractPrice = pricing.abstract_price;
          defaultSessionPrice = pricing.session_price;
          return false;
        }
        return true;
      });
      stateConfig.session_pricing.forEach(pricing => {
        if (
          pricing.scope === "public" &&
          pricing.sessions &&
          !isEmpty(pricing.sessions)
        ) {
          pricing.sessions.forEach(session => {
            if (session.hasOwnProperty("custom_session_id")) {
              publicSpecialPricingMap[session.custom_session_id] = [
                pricing.session_price,
                pricing.abstract_price,
              ];
            } else {
              publicSpecialPricingMap[session.SessionID.toString()] = [
                pricing.session_price,
                pricing.abstract_price,
              ];
            }
          });
        }
      });
      // if (defaultSessionPrice >= 0 && defaultAbstractPrice >= 0) {
      //The default for session is free or paid
      // Either allowed to sell the abstract or abstract price is free or paid
      let sessionOrderOf = 1;
      const tempSessions =
        isArray(stateConfig.session_list) &&
        stateConfig.session_list.length > 0 &&
        stateConfig.session_list.map(sess => {
          if (sess.StartTimeUnix == "") {
            return {
              ...sess,
              StartTimeUnix: 0,
            };
          }
          return sess;
        });
      const tempSessionList =
        tempSessions && tempSessions.length > 0
          ? _.orderBy(tempSessions, ["StartTimeUnix"], ["asc"])
          : [];
      tempSessionList.forEach(selectedSession => {
        //Excluding the do not create sessions from list
        if (
          doNotCreateProductSessionIDs.includes(
            parseInt(selectedSession.SessionID)
          )
        ) {
          return;
        }
        sessionIDs.push(selectedSession.SessionID);
        let tempConfigJSON = stateSessionConfigs[selectedSession.SessionID]
          ? stateSessionConfigs[selectedSession.SessionID]
          : stateSessionConfigs[selectedSession.SessionID.toString()] ?? {};
        tempConfigJSON = {
          ...tempConfigJSON,
          sessionOrderOf: sessionOrderOf,
        };
        sessionOrderOf += 1;
        const sessionCreditEvaluation =
          stateConfig.evaluations.find(
            rec =>
              parseInt(rec.SessionID) == parseInt(selectedSession.SessionID)
          ) ?? {};
        if (
          sessionCreditEvaluation.showEvaluation &&
          sessionCreditEvaluation.includeEvaluation
        ) {
          if (
            sessionCreditEvaluation.showCredits &&
            sessionCreditEvaluation.includeCredit &&
            stateConfig.credits.length > 0
          ) {
            let updatedCreditArray = [];

            stateConfig.credits.forEach(cre => {
              const creditToAdd = tempConfigJSON.credits_array.find(
                cred => parseInt(cred.id) == parseInt(cre.id)
              );
              if (creditToAdd) {
                updatedCreditArray.push({
                  ...creditToAdd,
                  label: cre.label,
                });
              }
            });
            tempConfigJSON = {
              ...tempConfigJSON,
              credits_array: updatedCreditArray,
            };
          } else {
            // Delete credit_array from config
            delete tempConfigJSON.credits_array;
          }
        } else {
          // Delete evaluation_config & credit_array from config
          delete tempConfigJSON.evaluation_config;
          delete tempConfigJSON.credits_array;
        }
        sessionProductRequest.push({
          ProductUUID: uuidv4(),
          LastUpdatedBy: 0,
          ProductLabel: selectedSession.SessionName,
          ConfigJSON: JSON.stringify(tempConfigJSON),
          Product_CategoryID: stateExecuteMigration.product_category_id,
          DefaultPrice: publicSpecialPricingMap[
            selectedSession.SessionID.toString()
          ]
            ? publicSpecialPricingMap[selectedSession.SessionID.toString()][0]
            : defaultSessionPrice,
          DigitalGood: 1,
          ProductNote: "",
          Hidden: 0,
          AutoRenew: 0,
          Internal_KeyID: 0,
          publication_date: stateConfig.conference?.Conf_StartDate
            ? moment(stateConfig.conference.Conf_StartDate).format("DD/MM/YYYY")
            : "",
        });
        const tempAbstracts = stateConfig.abstracts[
          selectedSession.SessionID.toString()
        ]
          ? stateConfig.abstracts[selectedSession.SessionID.toString()]
          : stateConfig.abstracts[selectedSession.SessionID];
        let presentationOrderOf = 1;

        let tempSortedAbstracts = Array.isArray(tempAbstracts)
          ? _.orderBy(tempAbstracts, ["Ab_Order"], ["asc"])
          : [];
        tempSortedAbstracts &&
          tempSortedAbstracts.forEach(abstract => {
            abstractIDs.push(abstract.ID);
            abstractProductRequest.push({
              ProductUUID: uuidv4(),
              LastUpdatedBy: 0,
              ProductLabel: abstract.AbTitle,
              ConfigJSON: JSON.stringify(
                stateAbstractConfigs[abstract.ID]
                  ? {
                      ...stateAbstractConfigs[abstract.ID],
                      presentationOrderOf: presentationOrderOf,
                    }
                  : {
                      ...stateAbstractConfigs[abstract.ID.toString()],
                      presentationOrderOf: presentationOrderOf,
                    } ?? { presentationOrderOf: presentationOrderOf }
              ),
              Product_CategoryID: stateExecuteMigration.product_category_id,
              DefaultPrice: sellAbstract
                ? publicSpecialPricingMap[selectedSession.SessionID.toString()]
                  ? publicSpecialPricingMap[
                      selectedSession.SessionID.toString()
                    ][1]
                  : defaultAbstractPrice
                : defaultAbstractPrice,
              DigitalGood: 1,
              ProductNote: "",
              Hidden: 0,
              AutoRenew: 0,
              Internal_KeyID: 0,
              publication_date: stateConfig.conference?.Conf_StartDate
                ? moment(stateConfig.conference.Conf_StartDate).format(
                    "DD/MM/YYYY"
                  )
                : "",
            });
          });
      });

      //adding the custom bundle product to create it in batch
      //adding the abstracts of custom bundles in stateConfig.abstracts

      stateConfig.custom_bundles.forEach(bundle => {
        sessionIDs.push(bundle.custom_session_id);
        let tempConfigJSON = {
          description: bundle.description,
          merged: [],
          sessionOrderOf: sessionOrderOf,
        };
        sessionOrderOf += 1;
        bundle.sessions.forEach(sess => {
          tempConfigJSON.merged.push(
            stateSessionConfigs[parseInt(sess.id)]
              ? stateSessionConfigs[parseInt(sess.id)]
              : stateSessionConfigs[sess.id.toString()] ?? {}
          );
        });
        sessionProductRequest.push({
          ProductUUID: uuidv4(),
          LastUpdatedBy: 0,
          ProductLabel: bundle.bundle_name,
          ConfigJSON: JSON.stringify(tempConfigJSON),
          Product_CategoryID: stateExecuteMigration.product_category_id,
          DefaultPrice: publicSpecialPricingMap[bundle.custom_session_id]
            ? publicSpecialPricingMap[bundle.custom_session_id][0]
            : defaultSessionPrice,
          DigitalGood: 1,
          ProductNote: "",
          Hidden: 0,
          AutoRenew: 0,
          Internal_KeyID: 0,
        });

        let presentationOrderOf = 1;
        bundle.sessions.forEach(sess => {
          stateConfig.abstracts[sess.id.toString()].forEach(abstract => {
            abstractIDs.push(abstract.ID);

            let tempAbsConfigJSON = stateAbstractConfigs[abstract.ID]
              ? stateAbstractConfigs[abstract.ID]
              : stateAbstractConfigs[abstract.ID.toString()] ?? {};
            tempAbsConfigJSON = {
              ...tempAbsConfigJSON,
              presentationOrderOf,
            };
            presentationOrderOf += 1;
            abstractProductRequest.push({
              ProductUUID: uuidv4(),
              LastUpdatedBy: 0,
              ProductLabel: abstract.AbTitle,
              ConfigJSON: JSON.stringify(tempAbsConfigJSON),
              Product_CategoryID: stateExecuteMigration.product_category_id,
              DefaultPrice: sellAbstract
                ? publicSpecialPricingMap[sess.id.toString()]
                  ? publicSpecialPricingMap[sess.id.toString()][1]
                  : defaultAbstractPrice
                : defaultAbstractPrice,
              DigitalGood: 1,
              ProductNote: "",
              Hidden: 0,
              AutoRenew: 0,
              Internal_KeyID: 0,
            });
          });
        });
      });

      dispatch(
        requestAddProducts({
          sourceHex: props.sourceHex,
          type: "session",
          type_ids: sessionIDs,
          products: sessionProductRequest,
        })
      );

      dispatch(
        requestAddProducts({
          sourceHex: props.sourceHex,
          type: "abstract",
          type_ids: abstractIDs,
          products: abstractProductRequest,
        })
      );
      // } else {
      //   console.error(
      //     "The default price is 'not for sale' of either for session or for abstract"
      //   );
      // }
    }
  }, [
    globalStatus.processed_session_products,
    stateExecuteMigration.conference_product,
  ]);

  //Step 3: Migrating session Product
  //Sub step2: Create session product pricing, access, relation. Create abstract product pricing, access, relation.
  useEffect(() => {
    //Adding conference pricing and conference access
    if (
      globalStatus.processed_session_products.length > 0 &&
      globalStatus.abstract_products_created &&
      !globalStatus.performRollback &&
      !isSessionProductPricingCreateInProgress &&
      !_.isEmpty(stateExecuteMigration.session_products) &&
      !_.isEmpty(stateExecuteMigration.abstract_products)
    ) {
      setIsSessionProductCreateInProgress(false);
      setIsSessionProductPricingCreateInProgress(true);
      console.log("Step 3.2");
      let sessionPricingRequest = [];
      let sessionAccessRequest = [];
      let abstractPricingRequest = [];
      let abstractAccessRequest = [];
      let sessionRelationRequest = [];
      let abstractRelationRequest = [];
      let sessionIDList = [];
      let abstractIDList = [];
      // let evaluationCreditRequest = [];
      stateConfig.session_list.forEach(session => {
        if (
          doNotCreateProductSessionIDs.includes(parseInt(session.SessionID))
        ) {
          return;
        }

        sessionIDList.push(session.SessionID);

        stateConfig.abstracts[session.SessionID].forEach(abstract => {
          abstractIDList.push(abstract.ID);
        });
      });

      //Custom Bundle
      stateConfig.custom_bundles.forEach(bundle => {
        sessionIDList.push(bundle.custom_session_id);

        stateConfig.abstracts[bundle.custom_session_id].forEach(abstract => {
          abstractIDList.push(abstract.ID);
        });
      });

      //session default pricing with -1 price
      for (const [sessionID, sessionProductDetails] of Object.entries(
        stateExecuteMigration.session_products
      )) {
        if (!sessionProductDetails.product_pricing_created) {
          let sessionDetails = {};
          stateConfig.session_list.every(session => {
            if (
              !doNotCreateProductSessionIDs.includes(
                parseInt(session.SessionID)
              ) &&
              !sessionID.toString().includes("bundle") &&
              parseInt(session.SessionID) === parseInt(sessionID)
            ) {
              sessionDetails = session;
              return false;
            }
            return true;
          });
          if (!isEmpty(sessionDetails)) {
            sessionPricingRequest.push({
              button: stateConfig.menu.Button,
              Fieldlabel: sessionDetails.SessionName ?? "",
              Rowlabel: `${sessionDetails.SessionName}`,
              ProductID: sessionProductDetails.product_id,
              Price: -1,
              ConfID: stateConfig.store.ConfID,
            });
          }
        }

        // Custom Bundle pricing request
        if (!sessionProductDetails.product_pricing_created) {
          let sessionDetails = {};
          stateConfig.custom_bundles.every(bundle => {
            if (bundle.custom_session_id === sessionID) {
              sessionDetails = bundle;
              return false;
            }
            return true;
          });
          if (!isEmpty(sessionDetails)) {
            sessionPricingRequest.push({
              button: stateConfig.menu.Button,
              Fieldlabel: sessionDetails.bundle_name ?? "",
              Rowlabel: `${sessionDetails.bundle_name}`,
              ProductID: sessionProductDetails.product_id,
              Price: -1,
              ConfID: stateConfig.store.ConfID,
            });
          }
        }
      }

      //abstract default pricing with -1 price
      for (const [abstractID, abstractProductDetails] of Object.entries(
        stateExecuteMigration.abstract_products
      )) {
        if (!abstractProductDetails.product_pricing_created) {
          let abstractDetails = {};
          for (const [sessionID, abstractDetailList] of Object.entries(
            stateConfig.abstracts
          )) {
            abstractDetailList.every(ab => {
              if (
                !doNotCreateProductSessionIDs.includes(parseInt(sessionID)) &&
                parseInt(abstractID) === parseInt(ab.ID)
              ) {
                abstractDetails = ab;
                return false;
              }
              return true;
            });
          }

          abstractPricingRequest.push({
            button: stateConfig.menu.Button,
            Fieldlabel: abstractDetails.AbTitle ?? "",
            Rowlabel: `${abstractDetails.AbTitle}`,
            ProductID: abstractProductDetails.product_id,
            Price: -1,
            ConfID: stateConfig.store.ConfID,
          });
        }
      }

      if (sellSession) {
        stateConfig.session_pricing.forEach(pricing => {
          if (pricing.scope === "public") {
            if (parseInt(pricing.session_price) === 0) {
              for (const [sessionID, sessionProductDetails] of Object.entries(
                stateExecuteMigration.session_products
              )) {
                if (!sessionProductDetails.product_pricing_created) {
                  wizardState.conference_pricing.contact_groups.forEach(
                    contactGroup => {
                      sessionAccessRequest.push({
                        ProductID: sessionProductDetails.product_id,
                        source: "Migration",
                        rel_type: "group_id",
                        rel_id: contactGroup.GroupID,
                      });
                    }
                  );
                }
              }
            } else if (parseInt(pricing.session_price) === -1) {
              //The default sessionPrice is not for Sales. Do Nothing.
            } else if (parseInt(pricing.session_price) > 0) {
              for (const [sessionID, sessionProductDetails] of Object.entries(
                stateExecuteMigration.session_products
              )) {
                if (!sessionProductDetails.product_pricing_created) {
                  let sessionDetails = {};
                  stateConfig.session_list.every(session => {
                    if (
                      !doNotCreateProductSessionIDs.includes(
                        parseInt(sessionID)
                      ) &&
                      !sessionID.toString().includes("bundle") &&
                      parseInt(session.SessionID) === parseInt(sessionID)
                    ) {
                      sessionDetails = session;
                      return false;
                    }
                    return true;
                  });
                  if (!isEmpty(sessionDetails)) {
                    sessionPricingRequest.push({
                      button: stateConfig.menu.Button,
                      Fieldlabel: sessionDetails.SessionName ?? "",
                      Rowlabel: pricing.price_label
                        ? `${sessionDetails.SessionName} (${pricing.price_label})`
                        : `${sessionDetails.SessionName}`,
                      ProductID: sessionProductDetails.product_id,
                      Price: pricing.session_price,
                      ConfID: stateConfig.store.ConfID,
                    });
                  }
                }

                if (!sessionProductDetails.product_pricing_created) {
                  let sessionDetails = {};
                  stateConfig.custom_bundles.every(bundle => {
                    if (
                      sessionID.toString().includes("bundle") &&
                      bundle.custom_session_id === sessionID
                    ) {
                      sessionDetails = bundle;
                      return false;
                    }
                    return true;
                  });

                  if (!isEmpty(sessionDetails)) {
                    sessionPricingRequest.push({
                      button: stateConfig.menu.Button,
                      Fieldlabel: sessionDetails.bundle_name ?? "",
                      Rowlabel: pricing.price_label
                        ? `${sessionDetails.bundle_name} (${pricing.price_label})`
                        : `${sessionDetails.bundle_name}`,
                      ProductID: sessionProductDetails.product_id,
                      Price: pricing.session_price,
                      ConfID: stateConfig.store.ConfID,
                    });
                  }
                }
              }
            }

            if (sellAbstract) {
              if (parseInt(pricing.abstract_price) === 0) {
                for (const [
                  abstractID,
                  abstractProductDetails,
                ] of Object.entries(stateExecuteMigration.abstract_products)) {
                  if (!abstractProductDetails.product_pricing_created) {
                    wizardState.conference_pricing.contact_groups.forEach(
                      contactGroup => {
                        abstractAccessRequest.push({
                          ProductID: abstractProductDetails.product_id,
                          source: "Migration",
                          rel_type: "group_id",
                          rel_id: contactGroup.GroupID,
                        });
                      }
                    );
                  }
                }
              } else if (parseInt(pricing.abstract_price) === -1) {
                //The default abstractPrice is not for Sale. Do nothing.
              } else if (parseInt(pricing.abstract_price) > 0) {
                for (const [
                  abstractID,
                  abstractProductDetails,
                ] of Object.entries(stateExecuteMigration.abstract_products)) {
                  if (!abstractProductDetails.product_pricing_created) {
                    let abstractDetails = {};
                    for (const [
                      sessionID,
                      abstractDetailList,
                    ] of Object.entries(stateConfig.abstracts)) {
                      abstractDetailList.every(ab => {
                        if (
                          !doNotCreateProductSessionIDs.includes(
                            parseInt(sessionID)
                          ) &&
                          parseInt(abstractID) === parseInt(ab.ID)
                        ) {
                          abstractDetails = ab;
                          return false;
                        }
                        return true;
                      });
                    }

                    abstractPricingRequest.push({
                      button: stateConfig.menu.Button,
                      Fieldlabel: abstractDetails.AbTitle ?? "",
                      Rowlabel: pricing.price_label
                        ? `${abstractDetails.AbTitle} (${pricing.price_label})`
                        : `${abstractDetails.AbTitle}`,
                      ProductID: abstractProductDetails.product_id,
                      Price: pricing.abstract_price,
                      ConfID: stateConfig.store.ConfID,
                    });
                  }
                }
              }
            }
          }
          if (pricing.scope == "attendee") {
            if (parseInt(pricing.session_price) === 0) {
              pricing.sessions.forEach(session => {
                pricing.attendees.forEach(attendee => {
                  sessionAccessRequest.push({
                    ProductID: session.hasOwnProperty("custom_session_id")
                      ? stateExecuteMigration.session_products[
                          session.custom_session_id
                        ].product_id
                      : stateExecuteMigration.session_products[
                          parseInt(session.SessionID)
                        ].product_id,
                    source: "Migration",
                    rel_type: "attendee_value_id",
                    rel_id: attendee.ValueID,
                  });
                });
              });
            } else if (parseInt(pricing.price) === -1) {
              console.error(
                "This case should not come. Abstract 'not for sale' attendee pricing"
              );
            } else if (parseInt(pricing.price) > 0) {
              //This should not happen
              console.error("Session with Paid type for Attendee selected.");
            }

            if (sellAbstract) {
              if (parseInt(pricing.abstract_price) === 0) {
                pricing.sessions.forEach(session => {
                  pricing.attendees.forEach(attendee => {
                    if (session.hasOwnProperty("custom_session_id")) {
                      stateConfig.abstracts[session.custom_session_id].forEach(
                        abstract => {
                          abstractAccessRequest.push({
                            ProductID:
                              stateExecuteMigration.abstract_products[
                                parseInt(abstract.ID)
                              ].product_id,
                            source: "Migration",
                            rel_type: "attendee_value_id",
                            rel_id: attendee.ValueID,
                          });
                        }
                      );
                    } else {
                      stateConfig.abstracts[session.SessionID].forEach(
                        abstract => {
                          abstractAccessRequest.push({
                            ProductID:
                              stateExecuteMigration.abstract_products[
                                parseInt(abstract.ID)
                              ].product_id,
                            source: "Migration",
                            rel_type: "attendee_value_id",
                            rel_id: attendee.ValueID,
                          });
                        }
                      );
                    }
                  });
                });
              } else if (parseInt(pricing.abstract_price) === -1) {
                console.error("This case should not come.", pricing);
              } else if (parseInt(pricing.abstract_price) > 0) {
                //This should not happen
                console.error("Abstract with Paid type for Attendee selected.");
              }
            }
          }
          if (pricing.scope === "group") {
            if (parseInt(pricing.session_price) === 0) {
              pricing.sessions.forEach(session => {
                pricing.groups.forEach(group => {
                  sessionAccessRequest.push({
                    ProductID: session.hasOwnProperty("custom_session_id")
                      ? stateExecuteMigration.session_products[
                          session.custom_session_id
                        ].product_id
                      : stateExecuteMigration.session_products[
                          parseInt(session.SessionID)
                        ].product_id,
                    source: "Migration",
                    rel_type: "group_id",
                    rel_id: group.GroupID,
                  });
                });
              });
            } else if (parseInt(pricing.session_price) === -1) {
              const groups = pricing.groups.map(group => group.GroupID);
              pricing.sessions.forEach(session => {
                sessionPricingRequest.push({
                  button: stateConfig.menu.Button,
                  Fieldlabel: session.hasOwnProperty("custom_session_id")
                    ? session.bundle_name
                    : session.SessionName ?? "",
                  Rowlabel: pricing.price_label
                    ? `${
                        session.hasOwnProperty("custom_session_id")
                          ? session.bundle_name
                          : session.SessionName
                      } (${pricing.price_label})`
                    : `${session.SessionName}`,
                  ProductID: session.hasOwnProperty("custom_session_id")
                    ? stateExecuteMigration.session_products[
                        session.custom_session_id
                      ].product_id
                    : stateExecuteMigration.session_products[
                        parseInt(session.SessionID)
                      ].product_id,
                  ThisHideFromGroup: groups.toString(),
                  Price: pricing.session_price,
                  ConfID: stateConfig.store.ConfID,
                });
              });
            } else if (parseInt(pricing.session_price) > 0) {
              const groups = pricing.groups.map(group => group.GroupID);
              pricing.sessions.forEach(session => {
                sessionPricingRequest.push({
                  button: stateConfig.menu.Button,
                  Fieldlabel: session.hasOwnProperty("custom_session_id")
                    ? session.bundle_name
                    : session.SessionName ?? "",
                  Rowlabel: pricing.price_label
                    ? `${
                        session.hasOwnProperty("custom_session_id")
                          ? session.bundle_name
                          : session.SessionName
                      } (${pricing.price_label})`
                    : `${session.SessionName}`,
                  ProductID: session.hasOwnProperty("custom_session_id")
                    ? stateExecuteMigration.session_products[
                        session.custom_session_id
                      ].product_id
                    : stateExecuteMigration.session_products[
                        parseInt(session.SessionID)
                      ].product_id,
                  ThisShowToGroup: groups.toString(),
                  Price: pricing.session_price,
                  ConfID: stateConfig.store.ConfID,
                });
              });
            }

            if (sellAbstract) {
              if (parseInt(pricing.abstract_price) === 0) {
                pricing.sessions.forEach(session => {
                  pricing.groups.forEach(group => {
                    if (session.hasOwnProperty("custom_session_id")) {
                      stateConfig.abstracts[session.custom_session_id].forEach(
                        abstract => {
                          abstractAccessRequest.push({
                            ProductID:
                              stateExecuteMigration.abstract_products[
                                parseInt(abstract.ID)
                              ].product_id,
                            source: "Migration",
                            rel_type: "group_id",
                            rel_id: group.GroupID,
                          });
                        }
                      );
                    } else {
                      stateConfig.abstracts[session.SessionID].forEach(
                        abstract => {
                          abstractAccessRequest.push({
                            ProductID:
                              stateExecuteMigration.abstract_products[
                                parseInt(abstract.ID)
                              ].product_id,
                            source: "Migration",
                            rel_type: "group_id",
                            rel_id: group.GroupID,
                          });
                        }
                      );
                    }
                  });
                });
              } else if (parseInt(pricing.abstract_price) === -1) {
                pricing.sessions.forEach(session => {
                  const groups = pricing.groups.map(group => group.GroupID);
                  if (session.hasOwnProperty("custom_session_id")) {
                    stateConfig.abstracts[session.custom_session_id].forEach(
                      abstract => {
                        abstractPricingRequest.push({
                          button: stateConfig.menu.Button,
                          Fieldlabel: abstract.AbTitle ?? "",
                          Rowlabel: pricing.price_label
                            ? `${abstract.AbTitle} (${pricing.price_label})`
                            : `${abstract.AbTitle}`,
                          ProductID:
                            stateExecuteMigration.abstract_products[
                              parseInt(abstract.ID)
                            ].product_id,
                          ThisHideFromGroup: groups.toString(),
                          Price: pricing.abstract_price,
                          ConfID: stateConfig.store.ConfID,
                        });
                      }
                    );
                  } else {
                    stateConfig.abstracts[session.SessionID].forEach(
                      abstract => {
                        abstractPricingRequest.push({
                          button: stateConfig.menu.Button,
                          Fieldlabel: abstract.AbTitle ?? "",
                          Rowlabel: pricing.price_label
                            ? `${abstract.AbTitle} (${pricing.price_label})`
                            : `${abstract.AbTitle}`,
                          ProductID:
                            stateExecuteMigration.abstract_products[
                              parseInt(abstract.ID)
                            ].product_id,
                          ThisHideFromGroup: groups.toString(),
                          Price: pricing.abstract_price,
                          ConfID: stateConfig.store.ConfID,
                        });
                      }
                    );
                  }
                });
              } else if (parseInt(pricing.abstract_price) > 0) {
                pricing.sessions.forEach(session => {
                  const groups = pricing.groups.map(group => group.GroupID);
                  if (session.hasOwnProperty("custom_session_id")) {
                    stateConfig.abstracts[session.custom_session_id].forEach(
                      abstract => {
                        abstractPricingRequest.push({
                          button: stateConfig.menu.Button,
                          Fieldlabel: abstract.AbTitle ?? "",
                          Rowlabel: pricing.price_label
                            ? `${abstract.AbTitle} (${pricing.price_label})`
                            : `${abstract.AbTitle}`,
                          ProductID:
                            stateExecuteMigration.abstract_products[
                              parseInt(abstract.ID)
                            ].product_id,
                          ThisShowToGroup: groups.toString(),
                          Price: pricing.abstract_price,
                          ConfID: stateConfig.store.ConfID,
                        });
                      }
                    );
                  } else {
                    stateConfig.abstracts[session.SessionID].forEach(
                      abstract => {
                        abstractPricingRequest.push({
                          button: stateConfig.menu.Button,
                          Fieldlabel: abstract.AbTitle ?? "",
                          Rowlabel: pricing.price_label
                            ? `${abstract.AbTitle} (${pricing.price_label})`
                            : `${abstract.AbTitle}`,
                          ProductID:
                            stateExecuteMigration.abstract_products[
                              parseInt(abstract.ID)
                            ].product_id,
                          ThisShowToGroup: groups.toString(),
                          Price: pricing.abstract_price,
                          ConfID: stateConfig.store.ConfID,
                        });
                      }
                    );
                  }
                });
              }
            }
          }
        });
      }

      //Adding the relation between conference Product and session Product
      for (const [sessionID, sessionProductDetails] of Object.entries(
        stateExecuteMigration.session_products
      )) {
        sessionRelationRequest.push({
          parent_id: stateExecuteMigration.conference_product.product_id,
          child_id: sessionProductDetails.product_id,
        });

        stateConfig.abstracts[sessionID].forEach(abstract => {
          abstractRelationRequest.push({
            parent_id: sessionID.toString().includes("bundle")
              ? stateExecuteMigration.session_products[sessionID].product_id
              : stateExecuteMigration.session_products[parseInt(sessionID)]
                  .product_id,
            child_id:
              stateExecuteMigration.abstract_products[parseInt(abstract.ID)]
                .product_id,
          });
        });
      }

      // if (stateConfig.include_evaluation_credit == "true") {
      //   stateConfig.evaluations.forEach(evalu => {
      //     let tempRequest = {};
      //     if (evalu.showEvaluation && evalu.includeEvaluation) {
      //       tempRequest = {
      //         sessionid: evalu.SessionID,
      //         productid:
      //           stateExecuteMigration.session_products[
      //             parseInt(evalu.SessionID)
      //           ].product_id,
      //       };
      //       if (
      //         evalu.showCredits &&
      //         evalu.includeCredit &&
      //         stateConfig.credits.length > 0
      //       ) {
      //         tempRequest = {
      //           ...tempRequest,
      //           cme_config: stateConfig.credits.map(credit => {
      //             return { id: credit.value, label: credit.label };
      //           }),
      //         };
      //       }
      //     }
      //     evaluationCreditRequest.push(tempRequest);
      //   });
      // }
      // console.log("evaluationCreditRequest", evaluationCreditRequest);

      //Deduplicate the sessionPricingRequest array. This is not a full-proof solution as it relies on JSON.stringfy to check the duplicate of objects
      const finalSessionPricingRequest = sessionPricingRequest.filter(
        (value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            sessionPricingRequest.findIndex(obj => {
              return JSON.stringify(obj) === _value;
            })
          );
        }
      );
      const finalSessionAccessRequest = sessionAccessRequest.filter(
        (value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            sessionAccessRequest.findIndex(obj => {
              return JSON.stringify(obj) === _value;
            })
          );
        }
      );

      //Deduplicate the abstractPricingRequest array. This is not a full-proof solution as it relies on JSON.stringfy to check the duplicate of objects
      const finalAbstractPricingRequest = abstractPricingRequest.filter(
        (value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            abstractPricingRequest.findIndex(obj => {
              return JSON.stringify(obj) === _value;
            })
          );
        }
      );
      const finalAbstractAccessRequest = abstractAccessRequest.filter(
        (value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            abstractAccessRequest.findIndex(obj => {
              return JSON.stringify(obj) === _value;
            })
          );
        }
      );

      dispatch(
        requestAddProductPricingAndAccess({
          sourceHex: props.sourceHex,
          type: "session",
          type_ids: sessionIDList,
          pricing: finalSessionPricingRequest,
          access: finalSessionAccessRequest,
        })
      );

      dispatch(
        requestAddProductPricingAndAccess({
          sourceHex: props.sourceHex,
          type: "abstract",
          type_ids: abstractIDList,
          pricing: finalAbstractPricingRequest,
          access: finalAbstractAccessRequest,
        })
      );

      dispatch(
        requestAddRelation({
          sourceHex: props.sourceHex,
          type: "session",
          type_ids: sessionIDList,
          relations: sessionRelationRequest,
        })
      );

      dispatch(
        requestAddRelation({
          sourceHex: props.sourceHex,
          type: "abstract",
          type_ids: abstractIDList,
          relations: abstractRelationRequest,
        })
      );

      // dispatch(
      //   requestCloneForm({
      //     sourceHex: props.sourceHex,
      //     appdir: props.appdir,
      //     evaluations: evaluationCreditRequest,
      //   })
      // );
    }
  }, [
    globalStatus.processed_session_products,
    stateExecuteMigration.session_products,
    stateExecuteMigration.abstract_products,
    globalStatus.abstract_products_created,
  ]);

  useEffect(() => {
    if (!migrationComplete) {
      let tempMigrationComplete = false;
      if (
        stateExecuteMigration.conference_product.product_created &&
        stateExecuteMigration.conference_product.product_pricing_created
      ) {
        for (const [sessionID, sessionProductDetails] of Object.entries(
          stateExecuteMigration.session_products
        )) {
          if (
            sessionProductDetails.product_created &&
            sessionProductDetails.parent_relation_created &&
            (sellSession ? sessionProductDetails.product_pricing_created : true)
          ) {
            tempMigrationComplete = true;
          } else {
            tempMigrationComplete = false;
            break;
          }
        }

        for (const [abstractID, abstractProductDetails] of Object.entries(
          stateExecuteMigration.abstract_products
        )) {
          if (
            abstractProductDetails.product_created &&
            abstractProductDetails.parent_relation_created &&
            (sellAbstract
              ? abstractProductDetails.product_pricing_created
              : true)
          ) {
            tempMigrationComplete = true;
          } else {
            tempMigrationComplete = false;
            break;
          }
        }
      }
      setMigrationComplete(tempMigrationComplete);
    }
  }, [
    stateExecuteMigration.conference_product,
    stateExecuteMigration.session_products,
    stateExecuteMigration.abstract_products,
  ]);

  useEffect(() => {
    if (globalStatus.performRollback && !globalStatus.rollbackCompleted) {
      executeRollback();
    }
  }, [globalStatus.performRollback]);

  useEffect(() => {
    if (migrationComplete) {
      const product_ids = getAllProductIDs();
      const config = { config: stateConfig, product_ids };
      const conferenceid = stateConfig.conference.ConferenceID;
      // Store the wizard Config
      dispatch(
        requestStoreWizardConfig({
          sourceHex: props.sourceHex,
          config,
          conferenceid,
        })
      );
      // Fix the file_size of the product files. Call the API
      dispatch(requestFixFileSize({ sourceHex: props.sourceHex }));
    }
  }, [migrationComplete]);
  const onClose = () => {
    // setVisible(false);
    setMigrationComplete(true);
  };
  const handleRestartWizard = () => {
    dispatch(requestStopMigration());
  };

  const getAllProductIDs = () => {
    let product_ids = [];

    if (!_.isEmpty(stateExecuteMigration.conference_product)) {
      //Gather conference product ID
      product_ids.push(stateExecuteMigration.conference_product.product_id);
    }

    // Gather sessions product ID
    for (const [sessionID, sessionProductDetails] of Object.entries(
      stateExecuteMigration.session_products
    )) {
      product_ids.push(sessionProductDetails.product_id);
    }

    // Gather abstract product ID
    for (const [abstractID, abstractProductDetails] of Object.entries(
      stateExecuteMigration.abstract_products
    )) {
      product_ids.push(abstractProductDetails.product_id);
    }
    return product_ids;
  };
  const executeRollback = () => {
    const product_ids = getAllProductIDs();
    dispatch(
      requestPerformRollback({
        sourceHex: props.sourceHex,
        product_ids,
        config: stateConfig,
      })
    );
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2%",
      }}
    >
      <Drawer
        title={`Migrating Event to E-Commerce Store`}
        placement="bottom"
        onClose={onClose}
        height="100%"
        visible={visible}
        keyboard={false}
        maskClosable={false}
        closable={false}
      >
        {globalStatus.rollbackCompleted ? (
          <Alert
            message="Migration Failed"
            description="Please restart and try again. If you continue to experience difficulty, please contact X-CD support."
            type="error"
            style={{
              width: "500px",
              alignItems: "center",
              marginTop: "5%",
              marginLeft: "40%",
            }}
            action={
              <Button
                size="small"
                primary
                type="primary"
                onClick={handleRestartWizard}
              >
                Restart
              </Button>
            }
          />
        ) : (
          <></>
        )}
        {globalStatus.rollbackFailed ? (
          <Alert
            message="Rollback Failed"
            description="Migration failed partially. Please contact X-CD support."
            type="error"
            style={{
              width: "500px",
              alignItems: "center",
              marginTop: "5%",
              marginLeft: "40%",
            }}
          />
        ) : (
          <></>
        )}

        {globalStatus.performRollback &&
        (!globalStatus.rollbackFailed || !globalStatus.rollbackCompleted) ? (
          <Alert
            message="Migration Failed"
            description="Starting to rollback the operation"
            type="error"
            style={{
              width: "500px",
              alignItems: "center",
              marginTop: "5%",
              marginLeft: "40%",
            }}
          />
        ) : (
          <></>
        )}

        {migrationComplete &&
        (!globalStatus.rollbackCompleted || !globalStatus.performRollback) ? (
          <div>
            <Result status="success" title="Successfully Migrated the Event" />
          </div>
        ) : (
          <div style={{ marginTop: "5%", marginLeft: "40%" }}>
            <Steps direction="vertical">
              <Step
                status={() => {
                  if (
                    globalStatus.session_configs_fetched &&
                    globalStatus.abstract_configs_fetched
                  ) {
                    return "finish";
                  } else if (globalStatus.rollbackCompleted) {
                    return "error";
                  } else {
                    return "process";
                  }
                }}
                title="Getting product details"
                subTitle="Fetching required data"
                icon={
                  globalStatus.session_configs_fetched &&
                  globalStatus.abstract_configs_fetched ? (
                    <CheckCircleOutlined />
                  ) : (
                    <LoadingOutlined />
                  )
                }
              />

              <Step
                status={() => {
                  if (
                    globalStatus.processed_conference_products.length > 0 &&
                    stateExecuteMigration.conference_product?.product_created &&
                    stateExecuteMigration.conference_product
                      ?.product_pricing_created
                  ) {
                    return "finish";
                  } else if (globalStatus.rollbackCompleted) {
                    return "error";
                  } else {
                    return "process";
                  }
                }}
                title="Migrating main event"
                subTitle="Event, Product Pricing, Product Access"
                icon={
                  globalStatus.processed_conference_products.length > 0 &&
                  stateExecuteMigration.conference_product?.product_created &&
                  stateExecuteMigration.conference_product
                    ?.product_pricing_created ? (
                    <CheckCircleOutlined />
                  ) : (
                    <LoadingOutlined />
                  )
                }
              />
              {sellSession ? (
                <Step
                  status={() => {
                    if (
                      globalStatus.processed_session_products.length > 0 &&
                      (stateConfig.sell_abstract == "true"
                        ? globalStatus.abstract_products_created
                        : true)
                    ) {
                      return "finish";
                    } else if (globalStatus.rollbackCompleted) {
                      return "error";
                    } else {
                      return "process";
                    }
                  }}
                  title="Migrating Sessions"
                  subTitle="Sessions, Presentations, Pricing and Relations"
                  // description="This might take time..."
                  icon={
                    globalStatus.processed_session_products.length > 0 &&
                    (stateConfig.sell_abstract == "true"
                      ? globalStatus.abstract_products_created
                      : true) ? (
                      <CheckCircleOutlined />
                    ) : (
                      <LoadingOutlined />
                    )
                  }
                />
              ) : (
                <></>
              )}
              <Step
                status="process"
                title="Finishing Up"
                subTitle="Completing final steps"
                icon={<LoadingOutlined />}
              />
            </Steps>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ExecuteMigration;
