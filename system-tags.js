import http from 'k6/http'

export const options = {
    vus: 5,
    duration: '5s',
    thresholds:{
        http_req_duration: ['p(95)<1000'],
        'http_req_duration{status:200}': ['p(95)<1000'],
        'http_req_duration{method:POST}': ['p(95)<1000'],
    }
}

export default function(){
    http.get('https://run.mocky.io/v3/bf6b1db7-aea8-4527-80c1-456b65822239');
    http.get('https://run.mocky.io/v3/881f4e8d-84c1-4d83-b54b-da4787c62ca2?mocky-delay=2000ms');
}

