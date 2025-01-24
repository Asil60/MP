const axios = require('axios');

const GRAFANA_URL = "http://18.136.43.13:3000";
const TOKEN = "glsa_gn1RsiYb9We3PpMZySoDGedybMWIMGMz_d33dc396";
const UID = "rYdddlPWk";

axios
    .get(`${GRAFANA_URL}/api/dashboards/uid/${UID}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    })
    .then((response) => {
        console.log("Dashboard Details:", response.data);
    })
    .catch((error) => {
        console.error("Error:", error.response.status, error.response.data);
    });
