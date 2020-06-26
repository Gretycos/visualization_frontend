import axios from 'axios';
import Qs from 'qs'

let baseUrl =  'http://127.0.0.1:8080'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true
axios.interceptors.request.use(config => {
        config.headers = {
            'Content-Type': 'application/x-www-form-urlencoded' // 设置很关键
        }
        return config
    },
    err => {
        return Promise.reject(err)
    });

// export const loadChinaData = params =>{
//     return  axios.post(baseUrl+"/china", Qs.stringify(params)).then(res=>res.data);
// }

export const loadAreaData = () =>{
    return  axios.post(baseUrl+"/area", {}).then(res=>res.data);
}

// export const logout = () =>{
//     return axios.post(baseUrl+"/logout",{}).then(res=>res.data)
// }
