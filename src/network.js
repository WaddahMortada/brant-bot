const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
export const fetchMiniatureEpiphanies = (period = 'week', limit = 20) => {
  return new Promise((resolve, reject) => {
    const endpoint = `https://www.reddit.com/r/Showerthoughts/top.json?t=${period}&obey_over18=true&over_18=false&limit=${limit}`
    console.log(`Fetching data from ${endpoint}`)
    const xhr = new XMLHttpRequest()
    xhr.open('GET', endpoint, true)
    xhr.withCredentials = false
    xhr.timeout = 5000
    xhr.ontimeout = () => {
      reject('request timed out')
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else {
          reject(xhr.status)
        }
      }
    }
    xhr.send()
  })
}

