import http from 'k6/http';

export default function() {
    const payload = JSON.stringify({
        username: 'kallango_test',
        password: 'test123',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json'
        },
    };

    let registerRes = http.post('https://test-api.k6.io/user/register', payload, params);
    console.log(registerRes.json().detail);

    // let res = http.post(
    //     'https://test-api.k6.io/auth/token/login/',
    //     JSON.stringify(
    //         {
    //             username: 'kallango_test',
    //             password: 'test123',
    //         },
    //         {
    //             headers: {
    //                 'Content-Type':'application/json'
    //             }
    //         }
    //     )
    // )

    // const accessToken = res.json().access;
    // console.log(accessToken);
}