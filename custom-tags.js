import http from 'k6/http';
import { Counter } from 'k6/metrics';
import { check, sleep } from 'k6';

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<310'],
        'http_req_duration{page:order}': ['p(95)<250'],
        'http_req_duration{page:homepage}': ['p(95)<250'],
        http_errors: ['count == 0'],
        'http_errors{page:order}': ['count==0'],
        'http_errors{page:homepage}': ['count==0'],
        checks: ['rate>=0.99'],
        'checks{page:order}': ['rate>=0.99'],
        'checks{page:homepage}': ['rate>=0.99'],
    }
}

let httpErrors = new Counter('http_errors');

export default function(){
    let res = http.get(
        'https://run.mocky.io/v3/bf6b1db7-aea8-4527-80c1-456b65822239',
        { 
            tags: {
                page: 'homepage'
            }
        }
    );

    if(res.error){
        httpErrors.add(1, {page:'homepage'});
    }

    check(res, {
        'status is 200': (r) => r.status === 200
    });

    res = http.get(
            'https://run.mocky.io/v3/881f4e8d-84c1-4d83-b54b-da4787c62ca2?mocky-delay=2000ms',
            {
                tags:{
                    page: 'order'
                }
            }
    );

    if(res.error){
        httpErrors.add(1, {page:'order'});
    }

    check(res, { 'status is 201': (r) => r.status === 201 }, { page: 'order'});

    sleep(1);
}