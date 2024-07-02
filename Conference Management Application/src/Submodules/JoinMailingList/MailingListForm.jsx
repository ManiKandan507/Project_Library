import React, { useEffect, useState } from "react";

const MailingListForm = props => {
  let [formState, setFormState] = useState({
    firstname: "",
    lastname: "",
    email: "",
    company: "",
    consentIDs_toadd: [],
  });
  let [areaOfInterest, setAreaOfInterest] = useState([]);
  let [postSuccess, setPostSuccess] = useState(0);
  let [thankYouMsg, setThankYouMsg] = useState("");
  let [consentIdsQuery, setConsentIdsQuery] = useState("");

  const xcdapi =
    "https://masterapp.econference.io/masterapp_summer2012/apiv2/index.cfm";

  const staticConfig = props.staticConfig;
  const handleChange = e => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheck = e => {
    let newArray = formState.consentIDs_toadd;

    if (newArray.find(obj => obj === e.target.value)) {
      newArray = newArray.filter(obj => obj !== e.target.value);
    } else {
      newArray.push(e.target.value);
    }

    setFormState({
      ...formState,
      consentIDs_toadd: newArray,
    });
  };

  const handleSubmit = () => {
    addSubscriberAPI();
  };

  const getAreaOfInterestAPI = async () => {
    let response = await fetch(
      `${xcdapi}?source=${
        staticConfig.source_hex
      }&module=client&component=email_marketing&function=get_marketing_consents&appdir=${
        staticConfig.appdir
      }${consentIdsQuery ? `&preferences=${consentIdsQuery}` : ""}`,
      {
        method: "GET",
      }
    );
    let responseJson = await response.json();
    setAreaOfInterest(responseJson);
  };

  const addSubscriberAPI = async () => {
    let formData = new FormData();

    for (let key in formState) {
      formData.append(key, formState[key]);
    }

    let response = await fetch(
      `${xcdapi}?source=${staticConfig.source_hex}&module=client&component=email_marketing&function=add_mailing_list_subscriber&appdir=${staticConfig.appdir}`,
      {
        method: "POST",
        body: formData,
      }
    );

    let responseJson = await response.json();
    setPostSuccess(responseJson?.success);
    setThankYouMsg(responseJson?.message);
  };

  useEffect(() => {
    if (areaOfInterest.length > 0) {
      return;
    }

    let urlParams = window.location.search;
    let consentIds = urlParams.split("consentid=")[1];

    if (consentIds) {
      setConsentIdsQuery(consentIds);
    } else {
      getAreaOfInterestAPI();
    }
  }, []);

  useEffect(() => {
    if (consentIdsQuery) {
      getAreaOfInterestAPI();
    }
  }, [consentIdsQuery]);

  useEffect(() => {
    if (postSuccess) {
      setFormState({
        firstname: "",
        lastname: "",
        email: "",
        company: "",
        consentIDs_toadd: [],
      });
    }
  }, [postSuccess]);

  return (
    <div>
      {!postSuccess ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <div style={{ marginRight: "10.5rem" }}>First Name:</div>
              <input
                type="text"
                name="firstname"
                style={{ width: "15rem" }}
                onChange={handleChange}
                value={formState.firstname}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <div style={{ marginRight: "10.5rem" }}>Last Name:</div>
              <input
                type="text"
                name="lastname"
                style={{ width: "15rem" }}
                onChange={handleChange}
                value={formState.lastname}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <div style={{ marginRight: "12.8rem" }}>Email:</div>
              <input
                type="text"
                name="email"
                style={{ width: "15rem" }}
                onChange={handleChange}
                value={formState.email}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <div style={{ marginRight: "11.2rem" }}>Company:</div>
              <input
                type="text"
                name="company"
                style={{ width: "15rem" }}
                onChange={handleChange}
                value={formState.company}
              />
            </label>
          </div>
          <div
            style={{
              marginBottom: "1rem",
            }}
          >
            <p style={{ marginRight: "8rem" }}>Area of Interest?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                width: "20rem",
                margin: "auto",
              }}
            >
              {areaOfInterest.map(obj => {
                return (
                  <div style={{ alignSelf: "flex-start", marginLeft: "2rem" }}>
                    <input
                      type="checkbox"
                      id={obj.label}
                      name={obj.label}
                      value={obj.consentID}
                      onChange={obj => handleCheck(obj)}
                      checked={
                        formState.consentIDs_toadd.find(
                          item => item == obj.consentID //purposely == to not check type because sometimes type not match
                        )
                          ? true
                          : false
                      }
                    />
                    <label for={obj.label}> {obj.label}</label>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ marginRight: "10.5rem" }}>
            <button onClick={handleSubmit} style={{ width: "5rem" }}>
              Subscribe
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "5rem" }}>{thankYouMsg}</div>
      )}
    </div>
  );
};

export default MailingListForm;
