import axios from 'axios'

export default axios.create({
  baseURL: process.env.webApiUrl + ':' + process.env.webApiPort,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Bouncr-Credential': 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyMSIsIm5hbWUiOiJUZXN0IFVzZXIxIiwicGVybWlzc2lvbnMiOlsicHJvamVjdDpyZWFkIiwicHJvamVjdDpjcmVhdGUiLCJwcm9qZWN0OnVwZGF0ZSIsInByb2plY3Q6ZGVsZXRlIl19.jlDVRGqFQ6_Kt4Agh5fN2_KVamXwM680sEjOKG0ku5s',
  },
  responseType: 'json',
})
