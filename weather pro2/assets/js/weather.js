// // weather.js — protected dashboard and weather fetch
// (function () {

//   // --- Auth guard: redirect to login if not logged in ---
//   const isLoggedIn = localStorage.getItem('wn_isLoggedIn') === 'true';
//   if (!isLoggedIn) {
//     window.location.href = 'index.html';
//     return;
//   }

//   const currentUser = JSON.parse(localStorage.getItem('wn_currentUser') || '{}');
//   const welcomeUserEl = document.getElementById('welcomeUser');
//   if (welcomeUserEl && currentUser && currentUser.name) {
//     welcomeUserEl.textContent = 'Hi, ' + currentUser.name;
//   }

//   // DOM refs
//   const searchBtn = document.getElementById('searchBtn');
//   const cityInput = document.getElementById('cityInput');
//   const cityName = document.getElementById('cityName');
//   const weatherDesc = document.getElementById('weatherDesc');
//   const tempEl = document.getElementById('temp');
//   const weatherIcon = document.getElementById('weatherIcon');
//   const feelsLike = document.getElementById('feelsLike');
//   const humidity = document.getElementById('humidity');
//   const wind = document.getElementById('wind');
//   const hourlyList = document.getElementById('hourlyList');

//   // Replace with your OpenWeatherMap API key:
//   const API_KEY = '0fdd4c63e2a3dd234e7569cc9405aa8f';

//   function formatTime(dt_txt) {
//     // dt_txt is format "YYYY-MM-DD hh:mm:ss" (from forecast endpoint)
//     const d = new Date(dt_txt);
//     return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
//   }

//   async function fetchWeatherByCity(city) {
//     if (!city) return;
//     // current weather
//     const cwUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
//     // 5-day / 3-hour forecast
//     const fcUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

//     try {
//       const [cwRes, fcRes] = await Promise.all([fetch(cwUrl), fetch(fcUrl)]);
//       if (!cwRes.ok) {
//         const json = await cwRes.json().catch(()=>({message:'Unable to fetch'}));
//         throw new Error(json.message || 'City not found');
//       }
//       if (!fcRes.ok) {
//         const json = await fcRes.json().catch(()=>({message:'Unable to fetch'}));
//         throw new Error(json.message || 'Forecast not found');
//       }

//       const cw = await cwRes.json();
//       const fc = await fcRes.json();

//       renderCurrent(cw);
//       renderHourly(fc);
//     } catch (err) {
//       alert('Error: ' + (err.message || err));
//       console.error(err);
       
//     }
//   }

//   function renderCurrent(data) {
//     cityName.textContent = `${data.name}, ${data.sys?.country || ''}`;
//     weatherDesc.textContent = data.weather?.[0]?.description || '';
//     tempEl.textContent = Math.round(data.main?.temp) + '°';
//     weatherIcon.src = data.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : '';
//     weatherIcon.alt = data.weather?.[0]?.description || 'weather icon';
//     feelsLike.textContent = Math.round(data.main?.feels_like) + '°';
//     humidity.textContent = (data.main?.humidity ?? '-') + '%';
//     wind.textContent = (Math.round((data.wind?.speed ?? 0) * 3.6)) + ' km/h'; // m/s -> km/h
//   }

//   function renderHourly(forecastData) {
//     hourlyList.innerHTML = '';
//     // forecastData.list is array in 3-hour increments; show next 8 entries (24h)
//     const list = forecastData.list || [];
//     const next = list.slice(0, 8);
//     next.forEach(item => {
//       const time = formatTime(item.dt_txt);
//       const temp = Math.round(item.main.temp) + '°';
//       const desc = item.weather?.[0]?.main || '';
//       const iconUrl = item.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${item.weather[0].icon}.png` : '';

//       const el = document.createElement('div');
//       el.className = 'hour-item';
//       el.innerHTML = `
//         <div style="display:flex;align-items:center;gap:10px">
//           <div class="time">${time}</div>
//           <img src="${iconUrl}" alt="${desc}" style="width:32px;height:32px"/>
//           <div class="muted" style="font-size:13px">${desc}</div>
//         </div>
//         <div class="t">${temp}</div>
//       `;
//       hourlyList.appendChild(el);
//     });

//   }
 
//   // search handling
//   searchBtn.addEventListener('click', function () {
//     const q = cityInput.value.trim();
//     if (!q) return alert('Please enter a city name.');
//     fetchWeatherByCity(q);
//   });

//   // allow Enter key on input
//   cityInput.addEventListener('keyup', function (e) {
//     if (e.key === 'Enter') {
//       searchBtn.click();
//     }
//   });

//   // load default city (optional)
//   const lastCity = localStorage.getItem('wn_lastCity') || 'Lagos ';
//   cityInput.value = lastCity;
//   fetchWeatherByCity(lastCity);

// })();


(function () {
  const isLoggedIn = localStorage.getItem('wn_isLoggedIn') === 'true';
  if (!isLoggedIn) {
    window.location.href = 'index.html';
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('wn_currentUser') || '{}');
  const welcomeUserEl = document.getElementById('welcomeUser');
  if (welcomeUserEl && currentUser?.name) {
    welcomeUserEl.textContent = 'Hi, ' + currentUser.name;
  }

  const searchBtn = document.getElementById('searchBtn');
  const cityInput = document.getElementById('cityInput');
  const cityName = document.getElementById('cityName');
  const weatherDesc = document.getElementById('weatherDesc');
  const tempEl = document.getElementById('temp');
  const weatherIcon = document.getElementById('weatherIcon');
  const feelsLike = document.getElementById('feelsLike');
  const humidity = document.getElementById('humidity');
  const wind = document.getElementById('wind');
  const hourlyList = document.getElementById('hourlyList');
  const errorBox = document.getElementById('errorBox');

  const API_KEY = '0fdd4c63e2a3dd234e7569cc9405aa8f';
  let errorTimeout;

  function showError(msg) {
    clearTimeout(errorTimeout);
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
    errorBox.classList.remove('fade-out');
    errorBox.classList.add('fade-in');
    clearWeatherDisplay();

    // Auto-hide after 4 seconds
    errorTimeout = setTimeout(() => {
      errorBox.classList.remove('fade-in');
      errorBox.classList.add('fade-out');
      setTimeout(() => (errorBox.style.display = 'none'), 600);
    }, 4000);
  }

  function clearError() {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }

  function clearWeatherDisplay() {
    cityName.textContent = '';
    weatherDesc.textContent = '';
    tempEl.textContent = '';
    weatherIcon.src = '';
    feelsLike.textContent = '';
    humidity.textContent = '';
    wind.textContent = '';
    hourlyList.innerHTML = '';
  }

  function formatTime(dt_txt) {
    const d = new Date(dt_txt);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  async function fetchWeatherByCity(city) {
    if (!city) {
      showError('Please enter a city name.');
      return;
    }

    clearError();
    try {
      const cwUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
      const fcUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

      const [cwRes, fcRes] = await Promise.all([fetch(cwUrl), fetch(fcUrl)]);

      if (!cwRes.ok) {
        const json = await cwRes.json().catch(() => ({ message: 'Unable to fetch' }));
        throw new Error(json.message || 'City not found');
      }
      if (!fcRes.ok) {
        const json = await fcRes.json().catch(() => ({ message: 'Unable to fetch' }));
        throw new Error(json.message || 'Forecast not found');
      }

      const cw = await cwRes.json();
      const fc = await fcRes.json();

      renderCurrent(cw);
      renderHourly(fc);
    } catch (err) {
      showError(err.message || 'Something went wrong');
      console.error(err);
    }
  }

  function renderCurrent(data) {
    const container = document.querySelector('.weather-display');
    if (container) container.classList.add('fade-in');

    cityName.textContent = `${data.name}, ${data.sys?.country || ''}`;
    weatherDesc.textContent = data.weather?.[0]?.description || '';
    tempEl.textContent = Math.round(data.main?.temp) + '°';
    weatherIcon.src = data.weather?.[0]?.icon
      ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      : '';
    weatherIcon.alt = data.weather?.[0]?.description || 'weather icon';
    feelsLike.textContent = Math.round(data.main?.feels_like) + '°';
    humidity.textContent = (data.main?.humidity ?? '-') + '%';
    wind.textContent = Math.round((data.wind?.speed ?? 0) * 3.6) + ' km/h';
  }

  function renderHourly(forecastData) {
    hourlyList.innerHTML = '';
    const list = forecastData.list || [];
    const next = list.slice(0, 8);
    next.forEach(item => {
      const time = formatTime(item.dt_txt);
      const temp = Math.round(item.main.temp) + '°';
      const desc = item.weather?.[0]?.main || '';
      const iconUrl = item.weather?.[0]?.icon
        ? `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`
        : '';

      const el = document.createElement('div');
      el.className = 'hour-item fade-in';
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <div class="time">${time}</div>
          <img src="${iconUrl}" alt="${desc}" style="width:32px;height:32px"/>
          <div class="muted" style="font-size:13px">${desc}</div>
        </div>
        <div class="t">${temp}</div>
      `;
      hourlyList.appendChild(el);
    });
  }

  searchBtn.addEventListener('click', function () {
    fetchWeatherByCity(cityInput.value.trim());
  });

  cityInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  const lastCity = localStorage.getItem('wn_lastCity') || 'Lagos';
  cityInput.value = lastCity;
  fetchWeatherByCity(lastCity);
})();
