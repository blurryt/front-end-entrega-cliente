// // let googleMapsPromise

// // export function loadGoogleMaps(libraries = ['places']) {
// //   if (googleMapsPromise) return googleMapsPromise

// //   googleMapsPromise = new Promise((resolve, reject) => {
// //     if (window.google && window.google.maps) {
// //       resolve(window.google.maps)
// //       return
// //     }
    

// //     const apiKey =  import.meta.env.VITE_GOOGLE_MAPS_API_KEY
// //     console.log(apiKey);

// //     const script = document.createElement('script')
// //     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`
// //     script.async = true
// //     script.defer = true
// //     script.onload = () => resolve(window.google.maps)
// //     script.onerror = (err) => reject(err)
// //     document.head.appendChild(script)
// //   })

// //   return googleMapsPromise
// // }


// export function loadGoogleMaps(libraries = ['places']) {
//   return new Promise((resolve, reject) => {
//     if (window.google && window.google.maps) {
//       resolve(window.google.maps)
//       return
//     }


//     const apiKey =  import.meta.env.VITE_GOOGLE_MAPS_API_KEY
//     console.log(apiKey);

//     const script = document.createElement('script')
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`
//     script.async = true
//     script.defer = true
//     script.onload = () => resolve(window.google.maps)
//     script.onerror = (err) => reject(err)
//     document.head.appendChild(script)
//   })
// }

export function loadGoogleMaps(apiKey, libraries = ['places']) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google.maps)
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}