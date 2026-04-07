/* API client – plain JS, no framework */
var API = (function () {
    'use strict';

    var BASE = '/api';

    function request(method, path, body) {
        var headers = { 'Content-Type': 'application/json' };
        var token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        var opts = { method: method, headers: headers };
        if (body !== undefined) {
            opts.body = JSON.stringify(body);
        }
        return fetch(BASE + path, opts).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    var err = new Error(data.message || ('HTTP ' + res.status));
                    err.status = res.status;
                    throw err;
                }
                return data;
            });
        });
    }

    return {
        login: function (email, password) {
            return request('POST', '/auth/login', { email: email, password: password });
        },
        register: function (data) {
            return request('POST', '/auth/register', data);
        },
        getSensorData: function () {
            return request('GET', '/my-data');
        },
        getAllWorkers: function () {
            return request('GET', '/all-workers');
        },
        getWorkerById: function (id) {
            return request('GET', '/worker/' + id);
        }
    };
}());
