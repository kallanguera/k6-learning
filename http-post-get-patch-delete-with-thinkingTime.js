import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween, randomString, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';

// export const options = {
//     vus: 5,
//     duration: '10s'
// }

const userCredentials = new SharedArray('users with credentials', function(){
    return JSON.parse(open('./users.json')).users;
})

console.log(userCredentials);

export default function() {
    
    console.log(__ENV.BASE_URL);
    
    userCredentials.forEach((item)=>{
        const payload = JSON.stringify({
            username: item.username,
            password: item.password
        });    
        
        //Uncomment to enable registration, need to change user or set a random one
        //http.post('https://test-api.k6.io/user/register/', payload, postParams);
        let token = getLoginToken(payload);    
    
        const crocodileData = {
                name: `Croc ${randomString(8)}`,
                sex: "M",
                date_of_birth: "1900-10-28"
        };
    
        const authenticatedHeader = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        };

        createCrocodile(authenticatedHeader.headers, crocodileData);
        const crocodileId = getCrocodileId(authenticatedHeader.headers);
        getCrocodile(crocodileId, authenticatedHeader.headers, crocodileData);
        patchCrocodileName(crocodileId, authenticatedHeader.headers);
        deleteCrocodile(crocodileId, authenticatedHeader.headers);
    })
}

function createCrocodile(headers, crocodileData){
    http.post(`${__ENV.BASE_URL}/my/crocodiles/`, 
        JSON.stringify(crocodileData),
        {
            headers,
            tags:{
                name: 'createCrocodile'
            }
        }
    );
}

function getCrocodileId(headers){
    const crocodiles = http.get(`${__ENV.BASE_URL}/my/crocodiles/`,        
        {
            headers,
            tags:{
                name: 'getCrocodileList'
            }
        }
    ).json();
        
    const crocodileIds = crocodiles.map(item => item.id);
    const crocodileId = randomItem(crocodileIds);    

    return crocodileId;
}

function getCrocodile(crocodileId, headers, crocodileData){
    let res = http.get(`${__ENV.BASE_URL}/my/crocodiles/${crocodileId}/`, 
        {
            headers: headers,
            tags:{
                name: 'getCrocodile'
            }                
        }
    );
    
    check(res, {
        'status is 200': (r) => r.status === 200,
        'crocodile id': (r) => r.json().id === crocodileId,
        'crocodile name': (r) => r.json().name === crocodileData.name,
        'crocodile sex': (r) => r.json().sex === crocodileData.sex,
        'crocodile date_of_birth': (r) => r.json().date_of_birth === crocodileData.date_of_birth
    })   

    console.log(res.json());
    console.log('>>>>>>>>>>> '+crocodileId);
}

function patchCrocodileName(crocodileId, headers){
    let res = http.patch(`${__ENV.BASE_URL}/my/crocodiles/${crocodileId}/`, 
        JSON.stringify({
            name: "Updated Croc Name"
        }),
        {
            headers,
            tags: {
                name: 'patchCrocodileName'
            }
        }
    );
        
    check(res, {
        'status is 200': (r) => r.status === 200,
        'crocodile id': (r) => r.json().id === crocodileId,
        'crocodile name': (r) => r.json().name === "Updated Croc Name",
        'crocodile sex': (r) => r.json().sex === crocodileData.sex,
        'crocodile date_of_birth': (r) => r.json().date_of_birth === crocodileData.date_of_birth
    })    
}

function deleteCrocodile(crocodileId, headers) {
    let res = http.del(`${__ENV.BASE_URL}/my/crocodiles/${crocodileId}/`, 
        null, 
        {
            headers,
            tags: {
                name: 'deleteCrocodile'
            }
        }
    );
    
    console.log("DELETE STATUS: "+ res.status);
    check(res, {
        'status is 204': (r) => r.status === 204,       
    })    
}

function getLoginToken(payload){
    return http.post(
        `${__ENV.BASE_URL}/auth/token/login/`, 
        payload, 
        {
            headers: {
                'Content-Type': 'application/json'
            },
            tags: {
                name: 'getLoginToken'            
            }
        }
    ).json().access;
}