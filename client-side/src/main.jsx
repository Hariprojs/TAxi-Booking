import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastContainer } from "react-toastify";
import Axios from "axios";
import "react-toastify/dist/ReactToastify.css"; 





const ignoredRoutes = ['https://nominatim.openstreetmap.org'];
Axios.interceptors.request.use(
  function (config) {
    if (!ignoredRoutes.some(route => config.url.includes(route))) {
      let div1 = document.createElement('div');
      div1.setAttribute('id', 'spinnerloader');
      let main = `
        <div class="preloader">
          <div class="preloader-inner ">
            <div class="loader">
              <div class="loader__filmstrip">
              </div>
              <p class="loader__text">
                LOADING
              </p>
            </div>
          </div>
        </div>
      `;

      div1.innerHTML = main;
      document.body.appendChild(div1);
    }

    return config;
  },
  function (error) {
    // document.body.classList.remove(" ");
    // div1.removeChild(div1.firstChild);
    const element = document.getElementById("spinnerloader");
    element?.remove();
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  function (response) {
    // div1.removeChild(div1.firstChild);
    // spinning hide
    const element = document.getElementById("spinnerloader");
    element?.remove();
    // document.body.classList.remove("loading-indicator");
    return response;
  },
  function (error) {
    // document.body.classList.remove("loading-indicator");
    const element = document.getElementById("spinnerloader");
    element?.remove();
    // div1.removeChild(div1.firstChild);
    return Promise.reject(error);
  }
);





ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <ToastContainer autoClose={2000}     />
    <App />
  </React.StrictMode>,
)
